# IMPLEMENTATION DETAILS

## Getting Set Up

  
1. Several new packages been installed so `npm install` is required
  
2. To make sure everything been installed correctly run integration tests: `npm run test`, integration tests located in `src/tests`

3. Next, `npm run seed` will seed the local SQLite database

4. Then run `npm start` which should start both the server and the React client.

5. Explore API endpoints via Swagger UI: `http://localhost:3001/api-docs/` - raw swagger schema located in `src/swagger.yaml`

  
## Technical Notes

  


### Integration tests
- `model.js` been modified, separate sequelize config added for integrations tests run
- Integration tests will use separate database file `database-test.sqlite3`
- Database seeds before each test for this reason tests are configured to run sequentially with help of `jest-serial-runner`

### Swagger UI
- to test API endpoints `swagger-ui-express` been added
- swagger schema located in `src/swagger.yaml`
- swagger ui interface availible at address: `http://localhost:3001/api-docs/` 

### Get contract by id
- SQL query been modified in order to fetch profiles alongside with contract and check if caller is either a client or contractor
- Regex filter been added to query in order to protect from SQL injection

### Get contracts by profile
- If thee are too many contracts for particular profile then API will be forsing client to use pagination with `offset` and `limit` parameters

### Get unpaid contracts
- Implemented with assumption that contract couldn't be terminated untill all jobs are payed

### Make payment endpoint
- Concurrent executions for the same profile are prevented by semafor - it is map that marks profiles for which payment operation is in progress, until it finished or failed other payment requests for same profile will result in `409 Conflict` error
- Semafor implemented as a couple of middlewares - one before processing to lock the profile and another after - to release it
- All state changes for Job and Profile tables are within same transaction to avoid mismanagement of state

### Topup client account endpoint
- Will run only for client profiles, request to other profiles will result in `400 Bad request` error
- Using the same semafor as make payment endpoint - locking per profile

### Best profession and best clients endpoints
- Implemented via raw queries, this queries might be heavy so calls to database are wrapped into deferring function called `throttle`, this funstion will not let to execute more than one query per period - other calls will line up in queue and resolving one-per-period. This will prevent overload on database in expense of response time

