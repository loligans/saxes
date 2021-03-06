"use strict";

// generates xml like test0="&control;"
const entitiesToTest = {
  // 'ENTITY_NAME': IS_VALID || [invalidCharPos, invalidChar],
  control0: true, // This is a vanilla control.
  // entityStart
  _uscore: true,
  "#hash": true,
  ":colon": true,
  "-bad": [0, "-"],
  ".bad": [0, "."],
  // general entity
  u_score: true,
  "d-ash": true,
  "d.ot": true,
  "all:_#-.": [5, "#"],
};

let xmlStart = "<a test=\"&amp;\" ";
const myAttributes = {};
myAttributes.test = "&";

let entI = 0;

const attributeErrors = [];
const ENTITIES = {};
// eslint-disable-next-line guard-for-in
for (const entity in entitiesToTest) {
  const attribName = `test${entI}`;
  const attribValue = `Testing ${entity}`;

  // add the first part to use in calculation below
  xmlStart += `${attribName}="&`;

  if (typeof entitiesToTest[entity] === "object") {
    const pos = entitiesToTest[entity][0];
    const first = pos === 0 ? "first " : "";

    attributeErrors.push([
      "error",
      `undefined:1:${xmlStart.length + pos + 1}: disallowed ${first}character \
in entity name.`,
    ]);
    myAttributes[attribName] = `&${entity};`;
  }
  else {
    ENTITIES[entity] = attribValue;
    myAttributes[attribName] = attribValue;
  }

  xmlStart += `${entity};" `;
  entI++;
}

require(".").test({
  name: "xml internal entities",
  expect: [
    [
      "opentagstart",
      {
        name: "a",
        attributes: {},
      },
    ],
    ...attributeErrors,
    [
      "opentag",
      {
        name: "a",
        attributes: myAttributes,
        isSelfClosing: true,
      },
    ],
    [
      "closetag",
      {
        name: "a",
        attributes: myAttributes,
        isSelfClosing: true,
      },
    ],
  ],
  fn(parser) {
    Object.assign(parser.ENTITIES, ENTITIES);
    parser.write(`${xmlStart}/>`).close();
  },
});
