# 통학러 (Back-End Application 종합)
<p align="center"> <img src="https://github.com/Yonge2/TUKBUS_Server/assets/99579139/9f842ee4-61c9-4ccc-abb6-bb25d614f7c9" width="550" height="380"/> </p>

## App
[소개페이지](https://tukbus.co.kr)

[안드로이드 다운로드](https://play.google.com/store/apps/details?id=com.tuk_bus&hl=ko)

## 목차
 1. 프로젝트 개요

 2. 기능

 3. 프로젝트의 구조와 개발&배포 환경

 4. 테스트와 API 문서
---

## 1. 프로젝트 개요

#### ‘통학‘이라는 일상 생활 속 불편함을 기술로써 불편함 해소에 기여해보자
>대학생에게 셔틀버스는 가장 많이 이용하는 학교 시설 중 하나 입니다. ‘한국 공학 대학교‘ 를 포함한 대부분의 학교는 표가 첨부된 PDF 파일과 같은 셔틀버스 시간표를 아날로그식으로 배포합니다.
>그래서 학생들은 시간표를 캡쳐 하거나 [학교 홈페이지 - 학교시설관련 페이지 – 셔틀버스 시간표] 와 같은 번거로운 방식을 통해 시간표를 보곤 합니다.
>
>또한, [대학교 근처 역 → 학교]로 또는 [학교 → 대학교 근처 역]으로의 택시를 혼자 이용하기도 하는데, 비용이 부담될 때가 종종 있었습니다.
>
>이는 너무 불편하다고 생각이 들었습니다. 그래서 조금 더 나은 방법을 찾는데 기여해보고자 시작하게 되었습니다.

---

## 2. 기능
### 비회원
* 통학정보 제공
  * 현재 시간 기준, 가까운 시간의 셔틀버스 시간표 4개
  * 셔틀 버스 탑승 시, 목적지 도착 예정 시간(실시간 교통 정보 활용)
  * 해당 학교 근처 지하철 실시간 정보
  * 17시 이후 일부 학교에서 제공되지 않는 시간표 생성 후 제공
<br/>

* 탑승위치 안내
  * 지도로 표시 (reactNative, appleMap 이용)

### 회원
* 학생 인증
  * 가입 시, 해당 대학교 이메일로 학생 인증
  * 로그인 이후, JWT를 이용한 자동인증
  * 아이디 생성 시, 임의의 닉네임 생성 (익명성)

* 택시 합승
  * 택시 합승 채팅 플랫폼 제공
  * 닉네임으로 활동
  * 목적지, 출발지, 출발 시간으로 학교 별 채팅방 개설
  * 비매너 사용자 차단/신고 기능

---

## 3. 프로젝트의 구조와 개발&배포 환경

### 프로젝트 구조

#### ● Micro Service Architecture 의 도입
 - 총 4개의 micro service, 기능별로 독립적 실행 구성
 - RDS 내부, 각각 독립적인 DataBase 생성
 - 종속적인 기능이 필요한 경우, http protocol, redis를 이용하여 micro service간 통신
 - NginX를 이용하여 하나의 WAS 처럼 구현
> *도입 후  
> 각 micro service의 모듈 응집도는 높아지고, 결합도는 낮아지는 효과,  
> 서비스의 유지보수성, 확장성이 높아지는 효과,  
> 배포의 편리성, 효율성이 높아지는 효과를 경험 
#### 프로젝트 전체 구조 참고 그림
![msa-new](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/6f2b0a0d-1dbc-4e43-9416-afc499d11f92)


#### 프로젝트 전체 Entity-Relationship-Diagram
![전체 erd](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/63128fbe-093e-4645-91f6-eb222a92b981)
*세부내용은 각 WAS의 README에 첨부했습니다.


### 프로젝트 개발&배포 환경
#### ● 개발도구
- 작업관련
  - IDE - VScode
  - 저장소 - git, GitHub
  - 로컬 실행 - powershell (windows10)
  - 가상화 실행환경 - WSL2 (Ubuntu 20.04)
- 개발관련
  - Runtime - Node.js 20.9
  - RDBMS - MySQL 8.0
  - NoSQL DBMS - Redis 6.2
  - Framework
    - auth-server : Express.js 4.18
    - schedule-server : Express.js 4.18
    - socket-io-server : Express.js 4.18, socket.io 4.7
    - chat-server : NestJS 10.2
  - 패키지관리 - NPM
  - Web Server - NginX 1.18 (Ubuntu)
  - Docker - Docker 25.0

#### ● 배포환경
  - 서버 - AWS EC2 t2.micro (Ubuntu 20.04)
  - RDBMS - AWS RDS t3.micro (MySQL 8.0)
  - Redis - [Cloud Redis Labs](https://redis.com/try-free/) (Redis 6.2)
  - 도메인 연결 - AWS Route53
  - SSL 인증서 - let's encrypt
  - 프로세스 관리 - PM2
---

## 4. 테스트와 API 문서

### 테스트
- 단위테스트
  - auth-server : TBD
  - schedule-server : TBD
  - socket-io-server : TBD
  - chat-server : TBD
  >*jest나 nodejs 내장 테스트 모듈 사용 예정
- API 테스트
  - Postman을 이용한 API 테스트 + 문서화 동시 진행
### API 개발 문서

[통학러 API Docs](https://documenter.getpostman.com/view/21311885/2sA2xnzAmY)

+ api 문서 사진 추가하기 +
---
 - open API
   - [서울시 공공데이터](https://data.seoul.go.kr/dataList/OA-12764/F/1/datasetView.do)
     - 실시간 지하철 정보 사용
     - 08시~23시 1분에 1회 업데이트 (setInterval method 사용)
   - [카카오 디벨로퍼스](https://developers.kakao.com/docs/latest/ko/kakaonavi/common)
     - 실시간 교통정보를 이용, 도착 예정 정보 사용
     - 이벤트 기반 호출, 캐싱으로 호출량 일((4~8)*시간표 갯수)회 이하 호출
   - [공휴일 정보](https://www.data.go.kr/data/15012690/openapi.do)
     - 공휴일에는 통학정보 미제공 (택시합승 채팅만 이용 가능)
     - 매 01시에 1회 작동(node-scheduler 사용)



## 기능 주요 로직
### REST API SERVER
#### 스케줄
 - **sequence diagram**
![schSeq](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/4cfd37d9-3fdb-453a-ac97-88e9e450a936)

 - **flow chart**
 ![시간표flowchart](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/7a92544d-ec88-478c-b3ef-c77db690c5d6)

<br/>

#### 채팅방 정보
 - **flow chart**
![채팅정보flowchart](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/31085212-2a3d-4ab7-b00d-b6edc0b75407)

<br/>
<br/>

### Socket.io SERVER
 - **sequence diagram**
![chatSeq](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/caecad56-2086-4722-a622-829a2d110d97)

 - **flow chart**
![채팅 flowchart](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/dc511907-9ab5-4821-9991-a631fe622fd3)


## API Docs
### Post Man 으로 API 테스트와 함께 API 문서화를 진행.
//api 문서 수정됨(3.18)
[통학러 API Docs](https://documenter.getpostman.com/view/21311885/2sA2xnzAmY)