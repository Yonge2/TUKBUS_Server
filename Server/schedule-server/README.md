# 통학러 Schedule-Server

## 목차

1.  개발 환경

2.  주요 기능 로직

3.  문제 & 해결

---

## 1. 개발환경

### 1-1. 사용기술

- Framework - Express.js 4.18
- RDBMS - MySQL 8.0
- Cache - Redis 6.2
- Library

  - bcrypt : 비밀번호 단방향 암호화
  - dayjs : 간편한 Date type 관리
  - axios : http 리소스 요청
  - node-schedule : batch 작업 관리

- open API
  - [실시간 지하철 정보](https://data.seoul.go.kr/dataList/OA-12764/F/1/datasetView.do)
    - 실시간 지하철 정보 사용
    - 08시~23시 1분에 1회 업데이트 (setInterval method 사용)
  - [실시간 교통정보 기반, 길찾기](https://developers.kakao.com/docs/latest/ko/kakaonavi/common)
    - 실시간 교통정보를 이용, 도착 예정 정보 사용
    - 이벤트 기반 호출, 캐싱으로 호출량 일((4~8)\*시간표 갯수)회 이하 호출
  - [공휴일 정보](https://www.data.go.kr/data/15012690/openapi.do)
    - 공휴일에는 통학정보 미제공 (택시합승 채팅만 이용 가능)
    - 매 01시에 1회 작동(node-scheduler 사용)

### 1-2. 모듈 구조

![schedule-server module](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/e5629311-d466-42e0-878e-e13029ce33c0)

---

## 2. 기능 주요 로직

### 2-1. 통학정보 생성 (Batch 작업)

![schedule-batch](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/e2c46dee-927d-45d9-ae51-3050d7c29fc1)

### 2-2. Get-Schedule (GET 이벤트)

![schedule-seq](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/479820e0-86a1-46a0-8019-b45008128751)
*cache hit : redis에서 바로 전달  
*cache miss : 시간표 생성 후 전달 (이후 캐싱)

### 2-3. Set-Schedule (POST 이벤트)

![set schedule-seq](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/f8fa66df-b9f4-444b-afb0-090f687c10b6)

---

## 3. 문제 & 해결

### 3-1. Kakao Developers 일 호출 제한

- 문제 : Open API 호출 일 제한 3000회 (예상 최대 호출 횟수 : 무한/일)
- 기존 : GET Event 마다 호출 및 생성
- 해결 : 생성 데이터 캐싱 후 데이터 변화 감지 시, 데이터 재 생성

```
* Redis hSet  VS  string set의 고민
-> string으로 선택

생성 데이터 타입 : 객체 배열

데이터의 Key는 단 하나로 설정이 가능했음.
변환 된 string이 영향이 있을 만큼 길지 않다는 판단.
```

- 결과 : 예상 최대 호출 횟수 (약 400회 / 일) 로 감소
- [상세 코드보기 - getScheduleService() 함수](https://github.com/Yonge2/TUKBUS_Server/blob/master/Server/schedule-server/schedule/schedule.get.service.js)

### 3-2. 실시간 지하철 정보 정렬

- 문제 : 서울시 공공데이터에서 응답으로 받은 지하철 정보의 정렬이 안되어서 오기 때문에 분류하기가 불편한 문제
- 기존 : client에 정렬 없이 무작위 순서의 지하철 정보 반환
- 해결 : 데이터 추출 후, 변환 과정에서 우선순위 프로퍼티를 추가
- 결과 : client에 Array.sort() 메서드로 정렬 후 반환
- [상세 코드보기](https://github.com/Yonge2/TUKBUS_Server/blob/master/Server/schedule-server/util/util.open-api/metro.js)
