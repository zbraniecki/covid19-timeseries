(function(e){function t(t){for(var n,s,i=t[0],l=t[1],c=t[2],d=0,f=[];d<i.length;d++)s=i[d],Object.prototype.hasOwnProperty.call(r,s)&&r[s]&&f.push(r[s][0]),r[s]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(e[n]=l[n]);u&&u(t);while(f.length)f.shift()();return o.push.apply(o,c||[]),a()}function a(){for(var e,t=0;t<o.length;t++){for(var a=o[t],n=!0,i=1;i<a.length;i++){var l=a[i];0!==r[l]&&(n=!1)}n&&(o.splice(t--,1),e=s(s.s=a[0]))}return e}var n={},r={app:0},o=[];function s(t){if(n[t])return n[t].exports;var a=n[t]={i:t,l:!1,exports:{}};return e[t].call(a.exports,a,a.exports,s),a.l=!0,a.exports}s.m=e,s.c=n,s.d=function(e,t,a){s.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s.t=function(e,t){if(1&t&&(e=s(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(s.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)s.d(a,n,function(t){return e[t]}.bind(null,n));return a},s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,"a",t),t},s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},s.p="/covid19-timeseries/";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],l=i.push.bind(i);i.push=t,i=i.slice();for(var c=0;c<i.length;c++)t(i[c]);var u=l;o.push([0,"chunk-vendors"]),a()})({0:function(e,t,a){e.exports=a("cd49")},"034f":function(e,t,a){"use strict";var n=a("85ec"),r=a.n(n);r.a},"070c":function(e,t,a){"use strict";var n=a("3186"),r=a.n(n);r.a},"08a2":function(e,t,a){"use strict";var n=a("8c71"),r=a.n(n);r.a},3186:function(e,t,a){},"359c":function(e,t,a){e.exports=a.p+"img/github.1fbf1eeb.png"},"5b99":function(e,t,a){e.exports=a.p+"img/twitter.d4e0338b.webp"},6082:function(e,t,a){},"7a8d":function(e,t,a){"use strict";var n=a("6082"),r=a.n(n);r.a},"85ec":function(e,t,a){},"8c71":function(e,t,a){},a05a:function(e,t,a){e.exports=a.p+"img/cds.5e68d72d.svg"},cd49:function(e,t,a){"use strict";a.r(t);a("e260"),a("e6cf"),a("cca6"),a("a79d");var n,r,o,s,i=a("2b0e"),l=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("dashboard")},c=[],u=a("d4ec"),d=a("262e"),f=a("2caf"),v=a("9ab4"),m=a("60a3"),h=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"dashboard"}},[a("main",[e.presentation==e.tableKey?a("data-table",{attrs:{id:"dataTable"}}):a("chart",{attrs:{id:"chart"}})],1),a("aside",[a("controls")],1)])},p=[],g=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("table",{class:{chrome:e.isChrome},style:e.cssVars,attrs:{cellspacing:"0",cellpadding:"0"}},[a("thead",[a("tr",{staticClass:"name"},[a("th"),e._l(e.nameRow,(function(t){return a("th",{key:t.id,attrs:{colspan:"2"}},[e._v(e._s(t.name))])})),e.legendColumn?a("th",{staticClass:"legend"}):e._e()],2),e._l(e.activeMetaRows,(function(t){return a("tr",{key:t.id,class:t.id},[a("th",[e._v(e._s(t.name)+":")]),e._l(t.values,(function(t){return a("th",{attrs:{colspan:"2"}},[e._v(e._s(t))])})),e.legendColumn?a("th",{staticClass:"legend"}):e._e()],2)})),a("tr",[a("th",[e._v("Δ Day")]),e._l(e.selectedRegions,(function(t){return[a("th",{staticClass:"date"},[e._v("Date")]),a("th",{staticClass:"value"},[e._v("#")])]})),e.legendColumn?a("th",{staticClass:"legend"}):e._e()],2)],2),a("tbody",e._l(e.dataRows,(function(t){return a("tr",{key:t.relDay,class:{log:t.relDay<0}},[a("td",{staticClass:"relDay",attrs:{title:"Click here to center"}},[a("a",{ref:"day"+t.relDay,refInFor:!0,staticClass:"target",attrs:{name:"day"+t.relDay}}),a("a",{attrs:{href:"#day"+t.relDay}},[e._v(e._s(t.relDay))])]),e._l(t.dates,(function(t){return[t?[a("td",{class:{date:t,today:t.isToday,normalized:t.normalized}},[e._v(e._s(t.date))]),a("td",{staticClass:"value",class:{normalized:t.normalized},style:t.normalized?{}:{backgroundColor:t.color}},[e._v(e._s(t.value))])]:[a("td",{staticClass:"empty"}),a("td",{staticClass:"empty"})]]})),e.legendColumn?a("td",{staticClass:"legend"},[e._v(e._s(0==t.relDay?"← Normalized relative day":t.relDay==e.todayRow?"← Today":""))]):e._e()],2)})),0)])},y=[],b=(a("caad"),a("b0c0"),a("b64b"),a("2532"),a("b85c"));a("99af"),a("a630"),a("a15b"),a("d81d"),a("fb6a"),a("b680"),a("4fad"),a("d3b7"),a("07ac"),a("ac1f"),a("25f0"),a("6062"),a("3ca3"),a("5319"),a("1276"),a("ddb0");(function(e){e["Table"]="table",e["Chart"]="chart"})(n||(n={})),function(e){e["Cases"]="cases",e["Deaths"]="deaths",e["Active"]="active",e["Recovered"]="recovered",e["Tested"]="tested",e["Hospitalized"]="hospitalized",e["Population"]="population"}(r||(r={})),function(e){e["Total"]="total",e["Delta"]="delta",e["EMA"]="ema"}(o||(o={})),function(e){e["Country"]="country",e["State"]="state",e["County"]="county",e["City"]="city"}(s||(s={}));var w=new Intl.NumberFormat(void 0),T=new Intl.NumberFormat(void 0,{style:"percent"}),_=new Intl.NumberFormat(void 0,{style:"percent",minimumFractionDigits:1}),V={enums:{keys:function(e){return Object.keys(e)},values:function(e){return Object.values(e)},entries:function(e){return Object.entries(e).map((function(e){return{id:e[1],name:e[0]}}))},default:function(e){return Object.keys(e)[0]},get:function(e,t){return null},getKey:function(e){return e}},getTypeValue:function(e,t){var a=this.enums.getKey(t),n=a,r=e[n];return void 0===r?null:r},getValuesForDateIdx:function(e,t){var a=e.dates[t];return void 0===a?null:a},getValue:function(e,t,a){var n=a.dataTypes,s=a.view;if(s===o.Delta){var i=this.getSelectionForView(a,o.Total),l=this.getValue(e,t,i);if(null===l)return l;var c=this.getValue(e,t-1,i);return null===c?null:c===l?0:0===c?1:l/c-1}if(s===o.EMA){var u=this.getSelectionForView(a,o.Total),d=this.getValue(e,t,u);if(null===d)return null;var f=this.calculateEMA(e,t,3,u),v=this.calculateEMA(e,t,7,u);return null===f||null===v?null:(f-v)/d}if(2==n.length){if(n[1]==r.Population){var m=this.getSelectionForDataTypes(a,[n[0]]),h=this.getValue(e,t,m);return this.divideByPopulation(e,h)}var p=this.getSelectionForDataTypes(a,[n[0]]),g=this.getValue(e,t,p);if(null===g)return null;var y=this.getSelectionForDataTypes(a,[n[1]]),b=this.getValue(e,t,y);return null===b||0===b?null:g/b}var w=n[0];if(w===r.Population)return null;var T=this.getValuesForDateIdx(e,t);return T?this.getTypeValue(T.value,n[0]):null},divideByPopulation:function(e,t){return e.meta.population&&null!==t?Math.round(t/(e.meta.population/1e6)):null},getLatestValue:function(e,t){var a=t.dataTypes[0],n=this.getTypeValue(e.latest,a);return n?this.getValue(e,n,t):null},formatValue:function(e,t){if(null===e)return"";var a=this.valueType(t);switch(a){case"percent":return T.format(e);case"number":return w.format(e);case"percentWithPrecision":return _.format(e)}},valueType:function(e){return e.view!==o.Total?"percent":1==e.dataTypes.length||e.dataTypes[1]==r.Population?"number":"percentWithPrecision"},getHighestValue:function(e,t){var a=t.dataTypes[0],n=this.getTypeValue(e.highest,a);return t.dataTypes.length>1&&"population"===t.dataTypes[1]?this.divideByPopulation(e,n):n},getSelectionForDataTypes:function(e,t){return Object.assign({},e,{dataTypes:t})},getSelectionForView:function(e,t){return Object.assign({},e,{view:t})},sortData:function(e,t,a){var n=this,r=this.getSelectionForView(a,o.Total);t.sort((function(t,a){var o=e[t],s=e[a],i=n.getLatestValue(o,r),l=n.getLatestValue(s,r);return null===i||isNaN(i)?1:null===l||isNaN(l)?-1:l-i}))},parseData:function(e){for(var t=0;t<e.dates.length;t++){var a=this.getValuesForDateIdx(e,t);null!==a&&(a.date=this.parseDate(a.date))}e.searchTokens=this.generateSearchTokens(e)},parseDate:function(e){var t,a,n,r,o=0,s=Object(b["a"])(e.split("-"));try{for(s.s();!(r=s.n()).done;){var i=r.value;switch(o){case 0:t=parseInt(i);break;case 1:a=parseInt(i);break;case 2:n=parseInt(i);break}o+=1}}catch(c){s.e(c)}finally{s.f()}if(void 0===t||void 0===a||void 0===n)throw new Error("Failed to parse date: ".concat(e));var l=new Date(t,a-1,n);return l},generateSearchTokens:function(e){var t=new Set;return this.addSearchTokensForLevel(t,e,s.Country),this.addSearchTokensForLevel(t,e,s.State),this.addSearchTokensForLevel(t,e,s.County),this.addSearchTokensForLevel(t,e,s.City),Array.from(t).join(" ").toLowerCase()},addSearchTokensForLevel:function(e,t,a){var n=t.meta[a],r=n.code,o=n.name;if(void 0!==r&&(e.add(r.toLowerCase()),void 0!==o)){var s,i=Object(b["a"])(o.toLowerCase().split(" "));try{for(i.s();!(s=i.n()).done;){var l=s.value;e.add(l)}}catch(c){i.e(c)}finally{i.f()}}},nFormatter:function(e,t){if(void 0===e)return"";var a,n=[{value:1,symbol:""},{value:1e3,symbol:" k"},{value:1e6,symbol:" M"},{value:1e9,symbol:" B"}],r=/\.0+$|(\.[0-9]*[1-9])0+$/;for(a=n.length-1;a>0;a--)if(e>=n[a].value)break;return(e/n[a].value).toFixed(t).replace(r,"$1")+n[a].symbol},getNormalizedIndex:function(e,t,a,n){for(var r={firstValue:null,relativeZero:null},o=0;o<t.dates.length;o++){var s=this.getValue(t,o,n);if(null===r.firstValue&&s&&(r.firstValue=o),null!==s&&s>a&&o>0){r.relativeZero=o-1;break}}return null===r.relativeZero&&(r.relativeZero=t.dates.length-1),r},interpolateColor:function(e,t,a){for(var n=e.slice(),r=0;r<3;r++)n[r]=Math.round(n[r]+a*(t[r]-e[r]));return"rgb(".concat(n[0],", ").concat(n[1],", ").concat(n[2],")")},isSameDay:function(e,t){return e.getDate()==t.getDate()&&e.getMonth()==t.getMonth()&&e.getFullYear()==t.getFullYear()},isToday:function(e){var t=new Date;return t.setDate(t.getDate()-1),this.isSameDay(t,e)},getCountNDaysSinceTheLast:function(e,t,a){for(var n=e.dates.length,r=null,o=n;o>=0;o--)if(null!==this.getValue(e,o,a)){r=o;break}if(null===r)return null;for(var s=r,i=r;i>=0&&r-t<i;i--)null!==this.getValue(e,i,a)&&(s=i);return this.getValue(e,s,a)},getClosestRoundedNumber:function(e){if(null===e)return 0;var t=e.toString(),a=t.length,n=Math.pow(10,a-1);return Math.floor(e/n)*n},calculateEMA:function(e,t,a,n){var r=this.getValue(e,t,n);if(null===r||t<1)return r;var o=this.calculateEMA(e,t-1,a,n);if(!o)return r;var s=2/(a+1);return r*s+o*(1-s)},isRegionIncluded:function(e,t,a){return!!t.taxonomyLevels.includes(e.meta.taxonomy)&&!(a.length>0&&void 0!==e.searchTokens&&!e.searchTokens.includes(a))}},x=[{id:"state",name:"State"},{id:"country",name:"Country"},{id:"population",name:"Popul."}],S={cases:{sentiment:-1},deaths:{sentiment:-1},active:{sentiment:-1},tested:{sentiment:1},recovered:{sentiment:1},hospitalized:{sentiment:-1}},C=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"numeric"}),$={name:"data-table",data:function(){return{metaRowsCount:"78px",legendColumn:!0,todayRow:8}},computed:{selectedRegions:function(){return this.$store.getters.selectedRegions},nameRow:function(){var e=this.$store.getters.selectedRegions,t=new Array(e.length);for(var a in e){var n=e[a];switch(n.meta.taxonomy){case s.Country:t[a]={id:n.id,name:n.meta.country.name};break;case s.State:t[a]={id:n.id,name:n.meta.state.name};break;case s.County:t[a]={id:n.id,name:n.meta.county.name};break;case s.City:t[a]={id:n.id,name:n.meta.city.name};break}}return t},activeMetaRows:function(){var e=this.$store.getters.selectedRegions,t={};for(var a in e){var n=e[a];switch(n.meta.taxonomy){case s.Country:break;case s.State:t["country"]||(t["country"]=new Array(e.length)),t["country"][a]=n.meta.country.name;break;case s.County:t["state"]||(t["state"]=new Array(e.length)),t["state"][a]=n.meta.state.name,t["country"]||(t["country"]=new Array(e.length)),t["country"][a]=n.meta.country.name;break;case s.City:t["state"]||(t["state"]=new Array(e.length)),t["state"][a]=n.meta.state.name,t["country"]||(t["country"]=new Array(e.length)),t["country"][a]=n.meta.country.name;break}n.meta.population&&(t["population"]||(t["population"]=new Array(e.length)),t["population"][a]=V.nFormatter(n.meta.population,2))}var r=19,o=Object.keys(t).length+1,i=40+r*o;this.metaRowsCount="-".concat(i,"px");var l,c=[],u=Object(b["a"])(x);try{for(u.s();!(l=u.n()).done;){var d=l.value;t[d.id]&&c.push({id:d.id,name:d.name,values:t[d.id]})}}catch(f){u.e(f)}finally{u.f()}return c},dataRows:function(){var e,t=this.$store.getters.selectedRegions,a=this.$store.getters.normalizedIndexes,n=this.$store.getters.selection,r=n.dataTypes[0],o=(this.$store.getters.sortedRegions,0),s=0,i=Object(b["a"])(t);try{for(i.s();!(e=i.n()).done;){var l=e.value,c=a[l.id];if(null!==c.firstValue){var u=c.relativeZero-c.firstValue;o<u&&(o=u);var d=l.dates.length-c.relativeZero;d>s&&(s=d)}}}catch(N){i.e(N)}finally{i.f()}for(var f=[],v=V.valueType(n),m="number"!==v?.3:t.length>0?V.getHighestValue(t[0],n):0,h=0;h<o+s;h++){var p,g=h-o,y=[],w=Object(b["a"])(t);try{for(w.s();!(p=w.n()).done;){var T=p.value,_=a[T.id],x=_.relativeZero-_.firstValue,$=_.relativeZero+g;if(g+x<0||$>=T.dates.length||null===V.getValue(T,$,n))y.push(null);else{var k=T.dates[$].date,D=V.getValue(T,$,n),R=D/m,j=1==S[r].sentiment&&D>0,O=j?[0,255,0]:[255,0,0];y.push({date:C.format(k),value:V.formatValue(D,n),color:V.interpolateColor([255,255,255],O,R),isToday:V.isToday(k),normalized:0==g})}}}catch(N){w.e(N)}finally{w.f()}f.push({relDay:g,dates:y})}var z=t[t.length-1];if(z){var L=a[z.id].relativeZero;z.dates[z.dates.length-1];this.todayRow=z.dates.length-L-1}return f},isChrome:function(){return navigator.userAgent.includes("Chrome/")},cssVars:function(){return{"--meta-rows":this.metaRowsCount}}},updated:function(){this.$nextTick((function(){this.$refs["day0"]&&this.$refs["day0"][0]&&this.$refs["day0"][0].scrollIntoView()}))},mounted:function(){this.$nextTick((function(){this.$refs["day0"]&&this.$refs["day0"][0]&&this.$refs["day0"][0].scrollIntoView()}))}},k=$,D=(a("7a8d"),a("2877")),R=Object(D["a"])(k,g,y,!1,null,"4c6740a2",null),j=R.exports,O=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("svg",{attrs:{id:"chartSvg",width:"100%",height:"100%"}})},z=[],L=a("5530"),N=a("5698"),F=a("2f62"),P={name:"chart",computed:Object(L["a"])({selectedRegions:function(){return this.$store.getters.selectedRegions}},Object(F["b"])(["data"])),mounted:function(){var e=this.$store.getters.selectedRegions,t=e[0];t&&this.draw(t)},watch:{selectedRegions:function(e){var t=this.$store.getters.selectedRegions,a=t[0];a&&this.draw(a)},data:function(e){var t=e;t.length&&(t=t[0],t&&this.draw(t))}},methods:{draw:function(e){var t=500,a=500,n={top:20,right:30,bottom:30,left:60},r=this.$store.getters.selection.dataTypes[0],o=N["h"]("#chart");o.selectAll("*").remove(),o.attr("viewBox",[0,0,a,t]);var s=N["g"]().domain(N["c"](e.dates,(function(e){return new Date(e.date)}))).range([n.left,a-n.right]),i=N["f"]().domain([0,N["e"](e.dates,(function(e){return e.value[r]}))]).nice().range([t-n.bottom,n.top]),l=function(e){return e.attr("transform","translate(0,".concat(t-n.bottom,")")).call(N["a"](s).ticks(a/80).tickSizeOuter(0))},c=function(e){return e.attr("transform","translate(".concat(n.left,",0)")).call(N["b"](i)).call((function(e){return e.select(".domain").remove()}))},u=N["d"]().defined((function(e){return!isNaN(e.value[r])})).x((function(e){return s(new Date(e.date))})).y((function(e){return i(e.value[r])}));o.append("g").call(l),o.append("g").call(c),o.append("path").datum(e.dates).attr("fill","none").attr("stroke","steelblue").attr("stroke-width",1.5).attr("stroke-linejoin","round").attr("stroke-linecap","round").attr("d",u)}}},I=P,A=Object(D["a"])(I,O,z,!1,null,"0f7989ee",null),M=A.exports,E=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"menu"}},[e._m(0),a("label",{attrs:{for:"dataTypeSelect"}},[e._v("Type:")]),a("select",{directives:[{name:"model",rawName:"v-model",value:e.dataType,expression:"dataType"}],attrs:{id:"dataTypeSelect"},on:{change:function(t){var a=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.dataType=t.target.multiple?a:a[0]}}},e._l(e.dataTypes,(function(t){return a("option",{domProps:{value:t.id}},[e._v(" "+e._s(t.name)+" ")])})),0),a("label",{attrs:{for:"dataType2Select"}},[e._v("Per:")]),a("select",{directives:[{name:"model",rawName:"v-model",value:e.dataType2,expression:"dataType2"}],attrs:{id:"dataType2Select"},on:{change:function(t){var a=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.dataType2=t.target.multiple?a:a[0]}}},e._l(e.dataTypes2,(function(t){return a("option",{domProps:{value:t.id}},[e._v(" "+e._s(t.name)+" ")])})),0),a("label",{attrs:{for:"viewSelect"}},[e._v("View:")]),a("select",{directives:[{name:"model",rawName:"v-model",value:e.view,expression:"view"}],attrs:{id:"viewSelect"},on:{change:function(t){var a=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){var t="_value"in e?e._value:e.value;return t}));e.view=t.target.multiple?a:a[0]}}},e._l(e.views,(function(t){return a("option",{domProps:{value:t.id}},[e._v(e._s(t.name))])})),0),a("label",{attrs:{for:"normalizeInput"}},[e._v("Normalize:")]),a("input",{attrs:{type:"text",placeholder:e.autoNormalizedValue,id:"normalizeInput"},domProps:{value:e.normalizationValue},on:{change:e.setNormalizationValue}}),a("input",{directives:[{name:"model",rawName:"v-model",value:e.regionSearchText,expression:"regionSearchText"}],staticClass:"regionSearch",attrs:{placeholder:"Search..."},domProps:{value:e.regionSearchText},on:{input:function(t){t.target.composing||(e.regionSearchText=t.target.value)}}}),a("input",{staticClass:"clearRegionSearch",attrs:{type:"button",value:"x"},on:{click:e.clearSearch}}),a("select",{ref:"regionSelect",staticClass:"regions",attrs:{multiple:""},on:{change:e.setSelectedRegions}},e._l(e.regionList,(function(t){return a("option",{key:t.id,domProps:{value:t.id,selected:e.selectedRegions.includes(t.id)}},[e._v(e._s(t.nameAndValue))])})),0),e._l(e.taxonomyLevels,(function(t){return[a("label",{attrs:{for:t.id+"Level"}},[e._v(e._s(t.name)+":")]),a("input",{attrs:{id:t.id+"Level",type:"checkbox"},domProps:{checked:e.selectedTaxonomyLevels.includes(t.id),value:t.id},on:{change:e.setTaxonomyLevel}})]}))],2)},Z=[function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("p",{staticClass:"links"},[n("a",{attrs:{href:"https://github.com/zbraniecki/covid19-timeseries"}},[e._v("Source: "),n("img",{staticClass:"icon",attrs:{src:a("359c")}})]),e._v(" | "),n("a",{attrs:{href:"https://coronadatascraper.com/"}},[e._v("Data: "),n("img",{staticClass:"icon",attrs:{src:a("a05a")}})]),e._v(" | "),n("a",{attrs:{href:"https://twitter.com/Nathan510edge"}},[e._v("Idea: "),n("img",{staticClass:"icon",attrs:{src:a("5b99")}}),e._v("Nathan510edge")])])}],B=(a("4de4"),a("2909")),K={name:"controls",data:function(){return{presentations:V.enums.entries(n),taxonomyLevels:V.enums.entries(s),regionSearchText:"",dataTypes:V.enums.entries(r).filter((function(e){return"population"!=e.id})),views:V.enums.entries(o)}},computed:{dataTypes2:function(){var e=this.$store.getters.selection,t=e.dataTypes[0];return[{id:"",name:""}].concat(Object(B["a"])(V.enums.entries(r).filter((function(e){return e.id!=t}))))},regionList:function(){var e=this.regionSearchText.toLowerCase(),t=this.$store.getters.selection;return this.$store.getters.sortedRegions.filter((function(a){return V.isRegionIncluded(a,t,e)})).map((function(e){var a=V.getLatestValue(e,t);return Object(L["a"])({nameAndValue:"".concat(e.displayName," -- ").concat(V.formatValue(a,t))},e)}))},selectedRegions:function(){var e=this.$store.getters.selectedRegions;return e.map((function(e){return e.id}))},normalizationValue:function(){return this.$store.state.selection.normalizationValue},autoNormalizedValue:function(){return this.$store.getters.autoNormalizedValue},dataType:{get:function(){return this.$store.getters.selection.dataTypes[0]},set:function(e){var t=this.$store.getters.selection.dataTypes[1];t?this.$store.commit("setDataTypes",[e,t]):this.$store.commit("setDataTypes",[e])}},dataType2:{get:function(){return this.$store.getters.selection.dataTypes[1]},set:function(e){var t=this.$store.getters.selection.dataTypes[0];e?this.$store.commit("setDataTypes",[t,e]):this.$store.commit("setDataTypes",[t])}},view:{get:function(){return this.$store.getters.selection.view},set:function(e){this.$store.commit("setView",e)}},selectedTaxonomyLevels:function(){return this.$store.getters.selection.taxonomyLevels},presentation:{get:function(){return this.$store.getters.selection.presentation},set:function(e){this.$store.commit("setPresentation",e)}}},methods:{setView:function(e){this.$store.commit("setView",e.target.value)},setSelectedRegions:function(e){var t,a=this.$store.getters.selection.regions,n=new Set(a),r=Array.from(e.target.options).filter((function(e){return!e.classList.contains("filtered")})),o=Object(b["a"])(r);try{for(o.s();!(t=o.n()).done;){var s=t.value;s.selected?n.add(s.value):n.delete(s.value)}}catch(i){o.e(i)}finally{o.f()}this.$store.commit("setSelectedRegions",Array.from(n))},setNormalizationValue:function(e){if(0===e.target.value.length)this.$store.commit("setNormalizationValue",null);else{var t=parseInt(e.target.value);this.$store.commit("setNormalizationValue",t)}},clearSearch:function(e){this.regionSearchText=""},setTaxonomyLevel:function(e){var t=e.target.value,a=e.target.checked,n=Array.from(this.$store.getters.selection.taxonomyLevels);a?(n.push(t),this.$store.dispatch("setTaxonomyLevels",n)):this.$store.dispatch("setTaxonomyLevels",n.filter((function(e){return e!=t})))}},watch:{selectedRegions:function(e){var t,a=this.$refs["regionSelect"],n=Object(b["a"])(a.options);try{for(n.s();!(t=n.n()).done;){var r=t.value;r.selected=e.includes(r.value)}}catch(o){n.e(o)}finally{n.f()}}}},H=K,J=(a("070c"),Object(D["a"])(H,E,Z,!1,null,"9ee78a82",null)),U=J.exports,W={name:"dashboard",components:{DataTable:j,Chart:M,Controls:U},mounted:function(){this.$store.dispatch("loadData",s.Country)},computed:{presentation:function(){return this.$store.getters.selection.presentation},tableKey:function(){return n.Table}}},Y=W,q=(a("08a2"),Object(D["a"])(Y,h,p,!1,null,"556d1172",null)),G=q.exports,Q=function(e){Object(d["a"])(a,e);var t=Object(f["a"])(a);function a(){return Object(u["a"])(this,a),t.apply(this,arguments)}return a}(m["b"]);Q=Object(v["a"])([Object(m["a"])({components:{Dashboard:G}})],Q);var X=Q,ee=X,te=(a("034f"),Object(D["a"])(ee,l,c,!1,null,null,null)),ae=te.exports,ne=(a("841c"),a("2b3d"),a("96cf"),a("1da1")),re={};function oe(e){var t,a=new URLSearchParams,n=Object(b["a"])(e.selection.regions);try{for(n.s();!(t=n.n()).done;){var r=t.value;a.append("region",r)}}catch(l){n.e(l)}finally{n.f()}var o,s=Object(b["a"])(e.selection.dataTypes);try{for(s.s();!(o=s.n()).done;){var i=o.value;i&&a.append("dataType",i)}}catch(l){s.e(l)}finally{s.f()}e.selection.view&&a.set("view",e.selection.view),e.selection.normalizationValue&&a.set("normalize",e.selection.normalizationValue),window.history.replaceState({},"","".concat(document.location.pathname,"?").concat(a).concat(document.location.hash))}function se(){var e=new URLSearchParams(document.location.search),t=e.getAll("dataType"),a=e.get("view"),r=e.get("normalize"),o=e.get("presentation");return{presentation:V.enums.get(n,o),regions:e.getAll("region"),dataTypes:t,view:a,normalizationValue:r}}function ie(e){return{presentation:e.selection.presentation||n.Table,dataTypes:e.selection.dataTypes.length>0?e.selection.dataTypes:[r.Cases],view:e.selection.view||o.Total,regions:e.selection.regions.length>0?e.selection.regions:[],normalizationValue:e.selection.normalizationValue,taxonomyLevels:e.selection.taxonomyLevels}}i["a"].use(F["a"]);var le=se(),ce=new F["a"].Store({state:{controls:{views:V.enums.values(n)},selection:{presentation:le.presentation,regions:le.regions,dataTypes:le.dataTypes,normalizationValue:le.normalizationValue,view:le.view,taxonomyLevels:[s.Country]},sortedRegionIds:[],loadedTaxonomies:new Set},getters:{autoNormalizedValue:function(e,t){var a=t.selectedRegions;if(0==a.length)return 0;var n,r=V.getSelectionForView(t.selection,o.Total),s=[],i=Object(b["a"])(a);try{for(i.s();!(n=i.n()).done;){var l=n.value;s.push(V.getCountNDaysSinceTheLast(l,5,r))}}catch(v){i.e(v)}finally{i.f()}for(var c=null,u=0,d=s;u<d.length;u++){var f=d[u];null!==f&&(null===c||c>f)&&(c=f)}return V.getClosestRoundedNumber(c)},normalizedIndexes:function(e,t){var a={},n=t.selectedRegions;if(0==n.length)return a;var r=e.selection.normalizationValue;null===r&&(r=t.autoNormalizedValue);var s,i=V.getSelectionForView(t.selection,o.Total),l=Object(b["a"])(n);try{for(l.s();!(s=l.n()).done;){var c=s.value;a[c.id]=V.getNormalizedIndex(e,c,r,i)}}catch(u){l.e(u)}finally{l.f()}return a},selectedRegions:function(e,t){var a=[],n=t.selection,r=n.regions,o=t.sortedRegions;if(0===r.length){var s,i=o.filter((function(e){return V.isRegionIncluded(e,n,"")})).slice(0,7),l=Object(b["a"])(i);try{for(l.s();!(s=l.n()).done;){var c=s.value;a.push(c)}}catch(v){l.e(v)}finally{l.f()}}else{var u,d=Object(b["a"])(o);try{for(d.s();!(u=d.n()).done;){var f=u.value;r.includes(f.id)&&a.push(f)}}catch(v){d.e(v)}finally{d.f()}}return a},selection:function(e){return ie(e)},sortedRegions:function(e){var t,a=[],n=e.sortedRegionIds,r=Object(b["a"])(n);try{for(r.s();!(t=r.n()).done;){var o=t.value,s=re[o];void 0!==s&&a.push(s)}}catch(i){r.e(i)}finally{r.f()}return a}},mutations:{setPresentation:function(e,t){e.selection.presentation=t},setSelectedRegions:function(e,t){e.selection.regions=t,oe(e)},setData:function(e,t){for(var a in t)re[a]=t[a],V.parseData(re[a]);var n=Object.values(re).map((function(e){return e.id})),r=ie(e);V.sortData(re,n,r),e.sortedRegionIds=n},setDataTypes:function(e,t){e.selection.dataTypes=t;var a=ie(e);V.sortData(re,e.sortedRegionIds,a),oe(e)},setNormalizationValue:function(e,t){e.selection.normalizationValue=t,oe(e)},setView:function(e,t){e.selection.view=t,oe(e)},setTaxonomyLevels:function(e,t){e.selection.taxonomyLevels=t}},actions:{loadData:function(e,t){return Object(ne["a"])(regeneratorRuntime.mark((function n(){var r,o,s,i,l;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:if(r=e.commit,o=e.state,!o.loadedTaxonomies.has(t)){n.next=3;break}return n.abrupt("return");case 3:return s=V.enums.getKey(t),n.next=6,fetch("".concat(a.p,"timeseries-").concat(s,".json"));case 6:return i=n.sent,n.next=9,i.json();case 9:l=n.sent,r("setData",l),o.loadedTaxonomies.add(t);case 12:case"end":return n.stop()}}),n)})))()},setTaxonomyLevels:function(e,t){return Object(ne["a"])(regeneratorRuntime.mark((function a(){var n,r,o;return regeneratorRuntime.wrap((function(a){while(1)switch(a.prev=a.next){case 0:n=Object(b["a"])(t),a.prev=1,n.s();case 3:if((r=n.n()).done){a.next=9;break}return o=r.value,a.next=7,e.dispatch("loadData",o);case 7:a.next=3;break;case 9:a.next=14;break;case 11:a.prev=11,a.t0=a["catch"](1),n.e(a.t0);case 14:return a.prev=14,n.f(),a.finish(14);case 17:e.commit("setTaxonomyLevels",t);case 18:case"end":return a.stop()}}),a,null,[[1,11,14,17]])})))()}},modules:{},strict:!0});i["a"].config.productionTip=!1,new i["a"]({store:ce,render:function(e){return e(ae)}}).$mount("#app")}});
//# sourceMappingURL=app.799b16ba.js.map