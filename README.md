# properties-volume-nodejs
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
<br>[![Greenkeeper badge](https://badges.greenkeeper.io/hmcts/properties-volume-nodejs.svg)](https://greenkeeper.io/)
<br>[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
<br>[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e9272daf4b714e4f95280916e763b6b2)](https://www.codacy.com/app/HMCTS/properties-volume-nodejs)
<br>[![Download](https://api.bintray.com/packages/hmcts/hmcts-maven/properties-volume-nodejs/images/download.svg) ](https://bintray.com/hmcts/hmcts-maven/properties-volume-nodejs/_latestVersion)
<br>[![Known Vulnerabilities](https://snyk.io/test/github/hmcts/properties-volume-nodejs/badge.svg)](https://snyk.io/test/github/hmcts/properties-volume-nodejs)
<br>[![codecov](https://codecov.io/gh/hmcts/properties-volume-nodejs/branch/master/graph/badge.svg)](https://codecov.io/gh/hmcts/properties-volume-nodejs)
<br>[![Build Status](https://travis-ci.com/hmcts/properties-volume-nodejs.svg?branch=master)](https://travis-ci.com/hmcts/properties-volume-nodejs.svg?branch=master)  


This module is to incorporate the integration of the Azure key-vault flex volume to node properties.


# Usage

## Quick start
```bash
$ yarn add @hmcts/properties-volume
```

Typescript:
```ts
import { Properties  } from '@hmcts/properties-volume'
Properties.configure()
```

- Javascript -

```js
require('properties-volume').configure()
```
