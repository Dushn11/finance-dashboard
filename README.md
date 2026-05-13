okay it's project have database, post/api/auth/register and post/api/auth/login, security all url without api/auth/** another all url need a token 
if you got error: 401 you don't have a great token
transaction:
get api/transaction - get a transaction
post api/transaction - create a new transaction
delete api/transaction/{id} - delete transaction by id
import:
post api/transaction/import - import  your CSV file and import your transaction
post api/transaction - accept from python data
stats:
get api/stats - returns sum of your balanc, income and expenses

WARNING!!
for proper operation you need to download: Apache Maven, Java and postgreSQL
