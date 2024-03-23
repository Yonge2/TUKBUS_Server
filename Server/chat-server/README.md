# 통학러 Chat-Server

## 목차

1.  개발 환경

2.  주요 기능 로직

3.  문제 & 해결

## 1. 개발환경

### 1-1. 사용기술

- Framework - NestJS 10.2
- RDBMS/ORM - MySQL 8.0 / TypeORM 0.3
- NoSQL DBMS - Redis 6.2
- Library
  - nestjs-real-ip : Micro Service 요청 간, IP확인
  - axios : http 리소스 요청
  - typeorm-naming-strategies : 네이밍 컨벤션

### 1-2. Entity Relationship Diagram

![채팅 erd](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/f32afdbe-73a2-4157-bb4f-9b2efb492dcb)

## 2. 기능 주요 로직

### 2-1. nickname 생성

- flow
  ![닉네임 생성](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/fa46555d-17e2-4298-8cd8-d3782b74028f)

- 무작위 생성 방식

```
관리자 권한으로 미리 준비해 둔 닉네임 요소를 조합하여 겹치지 않는 닉네임을 생성합니다.

닉네임 생성 방식 : (요소1) + (요소2) + (요소3)
Math.random() 메서드를 이용한 각 요소 선택 후 조합

*요소 1~3이 모두 같아서 닉네임이 겹칠 확률 : 1/15^3 (= 1/3375)
*현재 입력한 닉네임 요소는 15개씩이며, 이후 추가 가능
```

### 2-2. room

- CREATE-ROOM

  - roomId는 채팅방을 구분하는 유일한 식별자 -> uuid 로 설정
  - host는 방 생성 후, 바로 입장 처리

- GET-ROOM

  - 참여중인 채팅방이 있을 경우, 참여중인 채팅방 정보만 제공
  - 아닐 경우, 활성화 된 모든 채팅방 정보 제공

- ENTER-ROOM

  - 채팅방 입장 시, chat_log 테이블에 입장내역 생성
  - GET-MESSAGE 서비스에서 본인이 참여했던 채팅 내역만을 불러오기 위해, 입장 직후 해당 채팅방에서의 마지막 메시지의 인덱스+1을 저장

- OUT-ROOM
  - socket-io 통신이 의도치 않게 disconnected된 경우를 구분하기 위해 chat_log의 is_in=false 컬럼을 이용한 명시적 퇴장

### 2-3. message

- SAVE-MESSAGE

  - socket-io-server에서의 대화 내용 저장
  - 지속적 채팅방이 아닌, 일시적인 대화를 목적으로 만들어졌기 때문에, sender, receiver를 구분

- GET-MESSAGE
  - chat_log 테이블에서 first_msg_idx를 확인, 이후의 메시지까지만 불러올 수 있음.
  - pagination을 적용하여 한 번에 시간역순으로 20개씩 불러오도록 구현

## 3. 문제 & 해결

### 3-1. Micro service 간 리소스 요청 시, 보안 이슈

- 문제 : Micro Service 간 리소스 요청&응답으로 트랜잭션을 수행하는 로직을 일반 Client 요청 시, 잘못된 데이터 삽입 및 에러 가능성

- 기존 : 모두 허용

- 해결 : nestjs-real-ip 라이브러리를 이용하여 요청 아이피 식별, 미리 .env 파일에 제한해둔 IP외 요청 시, 접근 거부 반환

- 결과 : 일반 client의 직접 요청 시 응답 이미지(Postman)
  ![auth-보안-직접요청](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/6cefc63d-2f50-4f22-8f3e-fb6ace3551ba)

### 3-2. 너무 길며, 알아보기 힘든 구조의 Service Layer

- 문제 : service 레이어의 비즈니스 로직 구현 시, 코드가 너무 길고, 알아보기가 힘듦. 또한, Jest Mock 함수 생성 시 매우 복잡할 것으로 예상

- 기존 : Module-Controller-Service 구조

- 해결 : Repository Pattern의 도입 (Module-Controller-Service-Repository)

- 결과 : 데이터 조작 레이어를 추가함으로써 Service, Repository의 역할 명확하게 분리. 가독성 상승. 추후, Jest-Mock 데이터 생성 시에도 유용할 것으로 예상.

### 3-3. Redis Set 자료 구조를 통한 채팅방 참여 인원 정보 활용 개선

- 문제 : 빈번한 read/write 작업, 효율적이지 못하다고 느낀 채팅방 정보 관리

- 기존 : 채팅방 내부 현재 참여 인원을 MySQL-chat_log, chat_room 테이블에서 관계를 조회함으로써 구하는 방법

  - 채팅방 입장 시, 재입장인지 확인을 위한 조회 후 chat_log row 생성

  - 채팅방 인원 구할 시, **Count() Order by roomId** 연산

  ```sql
  SELECT C_L.room_id AS roomId, count(user_id) as inUsers
  FROM chat_log C_L
    JOIN chat_room C_R
    ON chat_log C_L.room_id = C_R.room_id
  WHERE C_R.is_live = true
    AND C_L.is_in = true
  ORDER BY C_L.room_id;

  --RESULT : [{roomId: 'room-A', inUsers: 2}, ...]
  ```

  - 채팅방 참여중인 인원 구할 시, MySQL 전체 테이블 조회 (논리적 연산 시간 O(N), N=테이블 rows)

- 개선 : Redis의 Set 자료구조 활용

  - 채팅방 입장 시, sAdd를 통해 재입장 중복 push 방지(조회 필요 X)

  - 채팅방 인원 구할 시, 단순 Set의 Length 연산 (sCard)

  ```javascript
  //roomId는 req로 받는다는 가정
  const getRoomMebers = async (roomId) => {
    const inUsers = await redis.sCard(roomId)
    return {
      roomId,
      inUsers,
    }
  }

  //RESULT : {roomId: 'room-A', inUsers: 2}
  ```

  - 채팅방 참여중인 인원 구할 시, 해당 Key 조회 (sMembers) (논리적 연산 시간 O(1))
