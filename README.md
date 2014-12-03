#nyc-geoclient

A node based wrapper for the New York City Geoclient API.  



**NYC GeoClient API:** https://developer.cityofnewyork.us/api/geoclient-api  
**NYC GeoClient API Docs:** https://api.cityofnewyork.us/geoclient/v1/doc  


This object defines the valid values for `responseType`.
```
RESPONSE_TYPE = {
  JSON: 'json',
  XML: 'xml'
};
```  


This object defines the valid values for `borough`.
```
BOROUGH = {
  MANHATTAN: 'manhattan',
  BRONX: 'bronx',
  BROOKLYN: 'brooklyn',
  QUEENS: 'queens',
  STATEN_ISLAND: 'staten island'
};
```  


This object defines the valid values for `compassDirection`.
```
DIRECTION = {
  N: 'N',
  S: 'S',
  E: 'E',
  W: 'W',
};
```  


`setApi(appKey, appId)`  
  Your application key and application ID from https://developer.cityofnewyork.us/


*For all API calls `responseType` will default to `RESPONSE_TYPE.JSON` if undefined or null.*

`address(houseNumber, street, borough, zip, responseType, callBack)`  
  **Must supply either borough or zip code.**  
  - houseNumber: The house number of the address. **Required**  
  - street: Street name or 7-digit street code. **Required**  
  - borough: One of the above boroughs. *Optional*  
  - zip: Zip code for the supplied address. *Optional*  
  - responseType: One of the above response types.   
  - callBack: node style call back function callBack(err, response)  

`bbl(borough, block, lot, responseType, callBack)`
  - borough: One of the above boroughs. **Required**  
  - block: Tax Block. **Required**   
  - lot: Tax Lot. **Required**   
  - responseType: One of the above response types.   
  - callBack: node style call back function callBack(err, response)

`bin(bin, responseType, callBack)`
  - bin: Building Identification Number. **Required**   
  - responseType: One of the above response types.   
  - callBack: node style call back function callBack(err, response)  

`blockface(onStreet, crossStreetOne, crossStreetTwo, borough, boroughCrossStreetOne, boroughCrossStreetTwo, compassDirection, responseType, callBack)`
  - onStreet: Street name of target blockface. **Required**   
  - crossStreetOne: First cross street of blockface. **Required**   
  - crossStreetTwo: Second cross street of blockface. **Required**   
  - borough: One of the above boroughs. **Required**    
  - boroughCrossStreetOne: Borough of first cross street. (Will default to 'borough' parameter). *Optional*  
  - boroughCrossStreetTwo: Borough of second cross street. (Will default to 'borough' parameter). *Optional*  
  - compassDirection: Used to request information on only one side of the street. *Optional*  
  - responseType: One of the above response types.   
  - callBack: node style call back function callBack(err, response)  

`intersection(crossStreetOne, crossStreetTwo, borough, boroughCrossStreetTwo, compassDirection, responseType, callBack)`
  - crossStreetOne: First cross street. **Required**   
  - crossStreetTwo: Second cross street. **Required**   
  - borough: One of the above boroughs. **Required**     
  - boroughCrossStreetTwo: Borough of second cross street. (Will default to 'borough' parameter). *Optional*  
  - compassDirection: One of the above directions. **Required for streets that intersect more than once.**  
  - responseType: One of the above response types.   
  - callBack: node style call back function callBack(err, response)  

`place(name, borough, zip, responseType, callBack):`  
  **Must supply either borough or zip code.**  
  - name: Name of place in NYC. **Required**   
  - borough: One of the above boroughs. *Optional*  
  - zip: Zip code for the supplied address. *Optional*  
  - responseType: One of the above response types.   
  - callBack: node style call back function callBack(err, response)  
