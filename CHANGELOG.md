 - fixed get contract by id API
SQL query been modified in order to fetch profiles alongside with contract and check if caller is either a client or contractor
Integration test added to cover all possible cases
Regex filter been added to query in order to protect from SQL injection
models.js been modified to make it compatible with integrations tests run


- added contracts endpoint and integrations tests
If thee are to many contracts for particular profile then API will be forsing client to use pagination

- added unpaid endpoint assuming the contract couldn't be terminated untill all jobs are payed


- added pay endpoint - semafor created to prevent diuble-spending - only one profile could be processed at a time otherwise Conflict error would be triggered. Changes in balances and job status wrapped into single transaction to prevent wrong state if application will suddenly shut down

- added deposit endpoint - works only for clients profile
- added best profession and best clients endpoint - query to database could be quite heavy thets why the query been wrapped into defer function - only one query could execute per THROTTLE_INTERVAL_MS - this prevents DB from overload


- Swagger UI been added to /api-docs/ route

