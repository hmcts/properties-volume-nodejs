# properties-volume-nodejs
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)
<br>[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
<br>[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e9272daf4b714e4f95280916e763b6b2)](https://www.codacy.com/app/HMCTS/properties-volume-nodejs)
<br>[![Download](https://api.bintray.com/packages/hmcts/hmcts-maven/properties-volume-nodejs/images/download.svg) ](https://bintray.com/hmcts/hmcts-maven/properties-volume-nodejs/_latestVersion)
<br>[![Known Vulnerabilities](https://snyk.io/test/github/hmcts/properties-volume-nodejs/badge.svg)](https://snyk.io/test/github/hmcts/properties-volume-nodejs)
<br>[![codecov](https://codecov.io/gh/hmcts/properties-volume-nodejs/branch/master/graph/badge.svg)](https://codecov.io/gh/hmcts/properties-volume-nodejs)
<br>[![Build Status](https://travis-ci.com/hmcts/properties-volume-nodejs.svg?branch=master)](https://travis-ci.com/hmcts/properties-volume-nodejs.svg?branch=master)  


This module is to incorporate the integration of the Azure key-vault flex volume to node properties.

# Usage
This module adds the properties volume entries into the configuration object from `'config'`
We use the default mount point of `/mnt/` volume, which happens exposes the key vault in [chart-nodejs](https://github.com/hmcts/chart-nodejs).

We use the last folder of the mount point, _secrets_, to map the properties into the configuration. 

Below is an example:
 ```json
{
  "secrets": {
    "VAULT": {
      "secretOne": "VALUE",
      "some-secret-two": "VALUE"
    },
    "VAULT2": {
      "secretOne": "VALUE",
      "some-secret-two": "VALUE"
    }
  }
}
```

**NOTE**
- The names are exactly as they are in on the volume or _key vault_. 
- **Defaults** can be added in your local configuration using the same object structure. I.E. `secrets.XXX.yyyy'
- For **testing** You can load these from a specified folder for testing i.e. `addTo( config, 'sometesting/folder/secrets')`.
- If you wish to use **multiple** property volumes you can change the mount point and the last folder will be used as the property prefix. I.E you can use `mountPoint="/mnt/certs/"` and this will put the properties in `certs.folder.xxx`

## Quick start
```bash
$ yarn add @hmcts/properties-volume
```

###Typescript
```typescript
import * as config from 'config'
import * as propertiesVolume from '@hmcts/properties-volume'
propertiesVolume.addTo(config)
```

###Javascript
```javascript
config = require('properties-volume').addTo(require('config'))
```
