import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import ddbClient, { scanAll } from '../clients/db';

const tableName = 'Articles';

async function usersRead() {
  const params: DocumentClient.ScanInput = {
    TableName: tableName,
  };

  let exclusiveStartKey;
  let count = 0;

  do {
    // `ExclusiveStartKey` allows to continue fetching more items starting from
    // the item after the last item in the previous response.
    exclusiveStartKey && (params.ExclusiveStartKey = exclusiveStartKey);

    const { Items, LastEvaluatedKey, Count }: DocumentClient.ScanOutput =
      await ddbClient.scan(params).promise();

    if (Items && Items.length) {
      console.log(JSON.stringify(Items, null, 2));
      console.log('\n');

      for await (const item of Items) {
        await createUser(item);
      }
    }

    if (Count) {
      count += Count;
    }

    exclusiveStartKey = LastEvaluatedKey;
  } while (exclusiveStartKey);
}

usersRead();

async function createUser(data: any) {
  const params: DocumentClient.PutItemInput = {
    TableName: `beta${tableName}`,
    Item: data,
  };

  await ddbClient.put(params).promise();
}
