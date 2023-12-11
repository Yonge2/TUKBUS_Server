# 통학러(Server)
<p align="center"> <img src="https://github.com/Yonge2/TUKBUS_Server/assets/99579139/9f842ee4-61c9-4ccc-abb6-bb25d614f7c9" width="550" height="380"/> </p>

## App
[소개페이지](https://tukbus.co.kr)

[안드로이드 다운로드](https://play.google.com/store/apps/details?id=com.tuk_bus&hl=ko)

## 순서
 - 프로젝트 개요
 - 기능
 - 기능 로직 ( 스케줄서버 / 채팅서버 )

## 프로젝트 개요

#### ‘셔틀 버스‘, 일상 생활 속 불편함을 찾아 기술적 해결로
>대학생에게 셔틀버스는 가장 많이 이용하는 학교 시설 중 하나 입니다. ‘한국 공학 대학교‘ 를 포함한 대부분의 학교는 셔틀버스 시간표를 아날로그식으로 배포합니다.
>
>그래서 학생들은 시간표를 캡쳐 하거나 [학교 홈페이지 - 학교시설관련 페이지 – 셔틀버스 시간표] 와 같은 번거로운 방식을 통해 시간표를 보곤 합니다.
>
>이는 너무 불편하다고 생각이 들었습니다. 그래서 조금 더 나은 방법을 찾아보고자 시작하게 되었습니다.

<br/>

### 프로젝트 아키텍처
 - 배포
   - EC2(t2.micro), Route53, let's encrypt, Nginx, pm2 모듈을 통한 배포
 - 구동
   - 하나의 EC2에 REST API Servr와 Socket.io Server 두 개의 서비스를 함께 구동
     - 이유 : 작은 서비스이기도 하고, pm2 모듈과 nginx로 감당 가능한 예상 부하라고 판단함
 - DB
   - EC2 내, MySQL 설치 후 사용
     - 이유 : 만들 당시 RDS의 존재를 몰랐음, 현재는 구동에 문제 없음 
     - 추후 필요시, RDS 사용 예정
   - Cloud Rdis : [Redis Labs](https://redis.com/)의 free memory 사용 중 
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
 - 전체 구조
 ![아키텍처](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/9de8477a-29cc-416c-8599-700926569dcf)

<br/>

### ERD
![통학러erd](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/364eada1-c17c-40f1-9de2-0b8d6c585b4d)


## 기능
### 비회원
* 셔틀버스 시간표 출력
  * 현재 시간 기준, 등/하교마다 시간표 4개
  * 셔틀 버스 탑승 시, 목적지 도착 예정 시간(실시간 교통 정보 활용)
  * 해당 학교 역 지하철 실시간 정보
  * 17시 이후 등교 버스는 실시간 교통 정보를 활용한 예상 시간표 출력
<br/>

* 탑승위치 안내
  * 지도로 표시 (reactNative, appleMap 이용)

### 회원
* 학생 인증
  * 가입 시, 해당 대학교 이메일로 학생 인증
  * 로그인 이후, JWT 발급
<br/>

* 택시 합승
  * 택시 합승 채팅방 제공
  * 목적지, 출발지, 출발 시간으로 채팅방 개설 가능
  * 비매너 사용자 차단/신고 기능


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

[통학러 API Docs](https://documenter.getpostman.com/view/21311885/2s93zGyxS1)