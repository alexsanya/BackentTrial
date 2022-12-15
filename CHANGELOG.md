 - fixed get contract by id API
SQL query been modified in order to fetch profiles alongside with contract and check if caller is either a client or contractor
Integration test added to cover all possible cases
Regex filter been added to query in order to protect from SQL injection
models.js been modified to make it compatible with integrations tests run


- added contracts endpoint and integrations tests
If thee are to many contracts for particular profile then API will be forsing client to use pagination

