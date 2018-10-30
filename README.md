# vue-pdf-reader

> A vue pdf reader component, based on [pdf.js](https://github.com/mozilla/pdf.js).

## How to use

``` bash
# install dependencies
npm install vue-pdf-reader
```
``` javascript
// use in vue
import VuePdfReader from 'vue-pdf-reader';
Vue.use(VuePdfReader);
```
``` css
/* CSS */
@import '~vue-pdf-reader/vue-pdf-reader.css';
```

Another way:

This package may cause long time to build with webpack, so you can import this lib as follows
```html
<head>
...
<link rel="stylesheet" type="text/css" href="${some_domain}/vue-pdf-reader.min.css">
<script src="${some_domain}/vue-pdf-reader.min.js"></script>
...
</head>

```


## Props
|propName|isRequired|defaultValue|remark|
|-|-|-|-|
|url|true|empty|The Uri for pdf file.|
|laoding-text|false|'File loading...'|The remind text for loading.|
|||||



## TODO
[ ] zoom document.

[ ] ...
