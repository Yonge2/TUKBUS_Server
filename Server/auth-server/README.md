# 통학러 Auth-Server

## 목차

1.  개발 환경

2.  주요 기능 로직

3.  문제 & 해결

## 1. 개발환경

### 1-1. 사용기술

- Framework - Express 4.18
- RDBMS - MySQL 8.0
- NoSQL DBMS - Redis 6.2
- Library
  - bcrypt : 비밀번호 단방향 암호화
  - node-mailer : email 인증에 사용
  - jsonwebtoken : 인증 관련 JWT 사용
  - axios : micro service 간 통신에 사용
  - uuid : id 식별자로 사용
  - request-ip : authorization 관련 보안 수단

## 2. 기능 주요 로직

### 2-1. 회원가입

- 순서

  - [email 중복확인] -> [email 인증] -> [회원 가입]

- email

  - email에 인증번호 전송
    ![통학러 인증메일](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/e9e3bb14-fc8c-4bdf-b07f-d5afb2d83092)

- email 인증 방식
  - Math.random() + string을 이용한 인증번호 생성
  - 인증번호와 인증여부를 redis에 ttl을 설정하여 저장
  - redis 인증여부 확인 후 회원가입 가능

### 2-2. 로그인

- Bcrypt

  - password를 비교

- JWT

  - 로그인 시, AccessToken과 RefreshToken을 생성

- AccessToken
  - 요청 시, 로그인 없이 인증을 위한 token 생성
  - 주로 chat-service에서 사용하기 때문에, nickname을 payload에 적재
  - nickname 가져오는 과정
    ![로그인](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/4150bb9b-a1c2-42bb-b50b-94d3ad9dd410)

### 2-3. Authorization

- 모든 Micro Service의 인증/인가를 auth-server로의 JWT 인증을 위임하는 방식
  ![jwt](https://github.com/Yonge2/TUKBUS_Server/assets/99579139/2f698c48-022f-409e-9679-f3293a2c82dd)

- 장점

  - private key를 Auth-Server 에서만 관리
  - 이후, 추가 보안 전략(ex. ip, mac address ...) 확장에 용이

- 단점
  - http 통신 리소스
  - Auth-Server에 의존적

## 3. 문제 & 해결

### 3-1. Bcrypt의 Salt는 .env로 관리해야할까?

- 문제 : Bcrypt Library를 이용하던 도중, Salt 관리를 유저별로 다르게, 그리고 숨겨야 할지에 대한 고민 (그렇게 되면 관리 난이도가 상승하기 때문에 고민)

- 해결 : Bcrpyt의 Salt는 따로 관리하지 않아도 된다는 결론.

- [이유와 설명을 정리한 블로그](https://blog.naver.com/dlwodyd25/223318477202)
