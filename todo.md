### 1. 가공상태가 STOPPED일 때는 MONGODB에 저장하지 않기
`Device.Components.2.Events.execution`는 총 4가지 상태가 존재한다.
- STOPPED
- ACTIVE
- INTERRUPETED
- READY
현재 상태를 저장하는 변수를 추가해서, 현재 상태가 `STOPPED`이면 변수를 더이상 저장하지 않게 변경
이후 `STOPPED`이 아닌 블럭을 만나면, 변수를 저장상태로 변경 이후 저장 계속 진행

### 2. data Header중 creationTime은 그대로 두고 data 저장 시간 변수를 Javascript 함수를 통해 새로 생성
데이터를 저장하는 과정에서 이전에 생성된 데이터와 충돌할 우려가 있음

### 3. MONGODB에서 최신 데이터 읽어와서 뿌려주는 API 개발

