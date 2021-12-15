const excelToJson = require('convert-excel-to-json');
import { v4 as uuid } from 'uuid';
import moment from 'moment';
const fs = require('fs');

interface Dictionary<T> {
  [Key: string]: T;
}

export function getCurrentTimeStamp(): number {
  return moment().utc().valueOf();
}

const sheetName = 'Регистрация врачей';
const fileName = 'medcheck-users';
const outputDir = 'src/data';

async function readExcel() {
  const keys: Dictionary<string> = {
    A: 'isAppend',
    C: 'lastName',
    D: 'firstName',
    E: 'patronymic',
    F: 'workplaces',
    G: 'specialities',
    H: 'specialities',
    I: 'workplaces',
    J: 'specialities',
    K: 'workplaces',
    L: 'specialities',
    N: 'education',
    O: 'experience',
    P: 'experienceSince',
    Q: 'level',
    R: 'education',
    S: 'phone',
    T: 'extraPhones',
    U: 'email',
    Y: 'clinicAddress',
    AB: 'servicesDescription',
    AC: 'consultationPrice',
  };

  const arrays = ['specialities', 'workplaces'];
  const strings = ['education'];
  const excludes = ['isAppend'];

  const items = excelToJson({
    sourceFile: `${outputDir}/${fileName}.xlsx`,
    header: {
      rows: 1,
    },
    sheets: [sheetName],
  });

  const result = [];

  for (const item of items[sheetName]) {
    const data: Dictionary<any> = {};
    let isAppend: boolean = false;

    Object.keys(keys).forEach((key: string) => {
      if (item.hasOwnProperty(key)) {
        const property: any = keys[key];

        const appData = item[key];

        if (excludes.includes(property)) {
          if (property === 'isAppend') {
            isAppend = appData === 'TRUE';
          }
        } else if (arrays.includes(property)) {
          if (!data[property]) {
            data[property] = [];
          }

          data[property].push(appData);
        } else if (strings.includes(property)) {
          if (data[property]) {
            data[property] += `\n${appData}`;
          } else {
            data[property] = appData;
          }
        } else {
          data[property] = appData;
        }
      }
    });

    console.log(isAppend);
    if (!isAppend) {
      data.id = uuid();
      data.joinDate = getCurrentTimeStamp();
      result.push(data);
    }
  }

  console.log('\n\n');
  console.log(`Total count: ${result.length}`);
  console.log('\n\n');

  // console.log(JSON.stringify(result, null, 2));
  await storeJson(result);
}

readExcel();

async function storeJson(input: any) {
  const data = JSON.stringify(input);

  // write JSON string to a file
  fs.writeFile(`${outputDir}/${fileName}.json`, data, (err: any) => {
    if (err) {
      throw err;
    }
    console.log('JSON data is saved.');
  });
}
