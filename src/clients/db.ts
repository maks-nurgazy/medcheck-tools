/* External dependencies */
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import orderBy from 'lodash/orderBy';
var AWS = require('aws-sdk');

export const {
  CARGO_TABLE_NAME,
  CONSIGNEES_TABLE_NAME,
  CONSIGNEE_PROFILES_TABLE_NAME,
  CONTRACTS_TABLE_NAME,
  EVENTS_TABLE_NAME,
  INVOICES_TABLE_NAME,
  PAYMENTS_TABLE_NAME,
  SCALE_TABLE_NAME,
  USERS_TABLE_NAME,
  VEHICLES_TABLE_NAME,
  WAREHOUSES_TABLE_NAME,
} = process.env;

const credentials = new AWS.SharedIniFileCredentials({
  profile: 'kuba-medcheck',
});
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-west-2' });
const ddbClient = new DocumentClient();

export default ddbClient;

export async function scanAll(
  params: DocumentClient.ScanInput
): Promise<DocumentClient.ScanOutput> {
  const items = [];
  let exclusiveStartKey;
  let count = 0;

  do {
    // `ExclusiveStartKey` allows to continue fetching more items starting from
    // the item after the last item in the previous response.
    exclusiveStartKey && (params.ExclusiveStartKey = exclusiveStartKey);

    const { Items, LastEvaluatedKey, Count }: DocumentClient.ScanOutput =
      await ddbClient.scan(params).promise();

    if (Items && Items.length) {
      items.push(...(Items as any));
    }

    if (Count) {
      count += Count;
    }

    exclusiveStartKey = LastEvaluatedKey;
  } while (exclusiveStartKey);

  return {
    Count: items.length || count,
    Items: items,
  };
}

export function extractItemsForPage(from: number, size: number) {
  return function ({ Items }: DocumentClient.ScanOutput) {
    const itemsCount = Items?.length || 0;
    const items = from < itemsCount ? Items!.slice(from, from + size) : [];

    return {
      Items: items,
    };
  };
}

export function orderItems(sort: any) {
  return function ({ Items }: DocumentClient.ScanOutput) {
    return {
      Items: orderBy(
        Items,
        sort.field,
        (sort.direction || 'DESC').toLowerCase() as any
      ),
    };
  };
}
