# Feature extractor / Metrics extensions

## Currently supported Feature extractor / Metrics extensions

All the metrics functions resolve a Promise object with the follow properties:

```js
{
    // { String }
    name: '<metric name, normally the same as the filename>',
    // { Number }
    index: opts.index,
    // { Number | String | Object }
    value: <your_calculated_value>
}
```

<a name="language"></a>
### Language

The value returned is the name of the language of the document in english.

```js
{
    name: 'language',
    index: opts.index,
    value: ['english' | 'spanish' | 'italian' | 'french' | ...]
}
```

<a name="length"></a>
### Length

The value returned is the number of characters in the document.

```js
{
    name: 'length',
    index: opts.index,
    value: 12345
}
```

<a name="perspicuity"></a>
### Perspicuity

The value returned is the perspicuity or easy to read the document.

```js
{
    name: 'perspicuity',
    index: opts.index,
    value: 133
}
```
Currently supported languages are <code>english (en-us)</code>, <code>spanish (es)</code> and <code>french (fr)</code>;

<a name="ranking"></a>
### Ranking

The value returned is the number of the ranking of the document in the original SERP.

```js
{
    name: 'ranking',
    index: opts.index,
    value: [1|2|3|4...]
}
```

<a name="keywords-position"></a>
### Keywords Position

The value returned is an <code>Object</code> with the keywords as keys and an <code>Array</code> of <code>Number</code> with the positions of said keywords.

```js
{
    name: 'keywords-position',
    index: opts.index,
    value: {
        'keyword-1': [111, 270, 274],
        'keyword-2': [23]
    }
}
```

<a name="links"></a>
### Links

The value returned is an <code>Array</code> of <code>String</code> with all of the Hosts (Domain and Subdomains) of the URLs found in the body text of the document.

```js
{
    name: 'links',
    index: opts.index,
    value: [
        'https://www.google.com',
        'https://www.usach.cl',
        'https://diinf.usach.cl',
        //...
    ]
}
```

<a name="multimedia"></a>
### Multimedia

The value returned is and <code>Object</code> with the frecuency as value for the keys of <code>audio</code>, <code>video</code> and <code>img</code>.

```js
{
    name: 'multimedia',
    index: opts.index,
    value: {
        'audio': 1,
        'video': 2,
        'img': 7
    }
}
```

<a name="category"></a>
### Category

The value returned is and <code>String</code> with the category value. Only two options:  Accidente del Trabajo | Enfermedad Profesional .

```js
{
    name: 'category',
    index: opts.index,
    value: "Accidente del Trabajo"
    }
}
```

<a name="courts"></a>
### Courts

The value returned is and <code>Object</code> with the courts associated to the case. and data related as 


<code> court</code>: first instance court (Tribunal de Primera Instancia).

<code> appelateCourt</code>: Apelation Court. (Corte de apleaciones).

<code> supreme</code>: Apelation Court. (Corte de apleaciones).


If any of the following is not present then it was not included in the response:


<code> entranceDate</code>: Date when the sentence was created

<code> rol</code>: Identification number of the court

<code> name</code>: Name of the court

<code> sentenceDate</code>: Date when the sentence was passed

<code> result</code>: Result of the case.

```js
{
    name: 'courts',
    index: opts.index,
    value: {
          "court": {
            "entranceDate": "2012-04-11 00:00:00",
            "rol": "O-1250-2012",
            "name": "1º JUZGADO DE LETRAS DEL TRABAJO DE SANTIAGO",
            "sentenceDate": "2012-08-09 00:00:00",
            "result": "Sentencia- Acoge Parcial"
          },
          "appelateCourt": {
            "entranceDate": "2012-08-31 00:00:00",
            "rol": "1258-2012",
            "resource": "Nulidad",
            "name": "C.A. de Santiago",
            "result": "Abandonado"
          },
          "supreme": {
            "rol": "-",
            "name": "Corte Suprema"
          }
        }
    }
}
```

<a name="injuries"></a>
### Injuries

The value returned is and <code>Object</code> with the health related injuries and consequences due the work-related accident or sickness  


<code> affectedBodyParts</code>: list of body zones that where injured according to the victim. CIE-10 classification.

<code> medicalDiagnosis</code>: medical diagnosis acording to a medic assign to assess the victim injuries. 

<code> dateMedicalDiagnosis </code>: Date of medical diagnosis results.

<code> sequels</code>: If any, sequels of the victim asociated to the case.

If any of the data above is not present then it was not included in the response.

```js
{
    name: 'injuries',
    index: opts.index,
    value: {
          "affectedBodyParts": [
            "EXT. INFERIORES- Cadera",
            "EXT. SUPERIORES-Codo"
          ],
          "medicalDiagnosis": [
            "FRACTURA DE CÚPULA RADIAL Y OLÉCRANON DERECHO",
            "FRACTURA DESPLAZADA DE CUELLO FEMORAL DERECHO"
          ],
          "dateMedicalDiagnosis": "2011-05-09 00:00:00",
          "sequel": {
            "listSequels": [
              "PSEUDOARTROSIS CUELLO FEMORAL DERECHO"
            ],
            "dateDiagnosis": "2011-05-09 00:00:00",
            "source": "Informe Mutualidades"
          }
        }
}
```

<a name="injuries"></a>
### Injuries

The value returned is and <code>Object</code> with the money amounts given (otorgado) to the victim or asked by the victim (demandado) for compensation due the work-related accident or sickness .


<code> otorgado</code>: amount given to the victim

<code> demandado</code>: amount asked for the victim

<code> demandado</code>: amount asked for the victim

Every amount was given in Unidad de Fomento (UF)

<code> primeraUF</code>

<code> demandadoUF</code> 

...and Chilean Pesos (CLP)

<code> primera</code>

<code> demandado</code>

Also the amounts were brough to present value acording to economy fluctuation on UF and CLP
<code> primeraPresente</code>

<code> demandadoPresente</code>

<code> primeraPresenteUF</code>

<code> demandadoPresenteUF</code>

For now only supports first instance court so amounts.

```js
{
    name: 'lawsuit-ammount',
    index: opts.index,
    value: {
          "otorgado": {
            "primera": "15000000",
            "primeraPresente": "19820008",
            "primeraUF": "686.61",
            "primeraPresenteUF": "691.10"
          },
          "demandado": {
            "demandado": "120000000",
            "demandadoPresente": "158560064",
            "demandadoUF": "5492.90",
            "demandadoPresenteUF": "5528.82"
          }
        }
}
```

<a name="personal-victim-data"></a>
### Victims personal data

The value returned is and <code>Object</code> with the victim's personal data.

<code> edad</code>: Age of the victim

<code> sexo</code>: Victim's sex (Male | Female) (Masculino | Femenino)


```js
{
    name: 'personal-victim-data',
    index: opts.index,
    value: {
          "edad": "35 años",
          "sexo": "Masculino "
        }
}
```

<a name="modules"></a>
### Modules

The value returned is and <code>Object</code> with the victim's personal data.

<code> CodigoModulo</code>: Module's Code to identify it self.

<code> Link</code>: Donwloadable link of the module

<code> Duracion</code>: Module's duration.

<code> Nombre</code>: Module's name.

<code> DataPdf</code>: PDF of module on Base64 encoding.



```js
{
    name: 'modules',
    index: opts.index,
    value: {
            "CodigoModulo": "MA01726",
            "Link": "https://sistemas.sence.cl/sipfor/Planes/PDFModulo.aspx?id=MA01726",
            "Duracion": 88,
            "Nombre": "PROTOCOLOS Y PROCEDIMIENTOS DE SOLUCIÓN DE REQUERIMIENTOS DE EMERGENCIA EN PLATAFORMA TELEFÓNICA",
            "DataPdf": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9MZW5ndGggND..."
          }
        ],
}
```


<a name="sector"></a>
### Sector

The value returned is and <code>String</code> with the sector category of a training plan.



```js
{
    name: 'sector',
    index: opts.index,
    value: "SUMINISTRO DE GAS, ELECTRICIDAD Y AGUA"
}
```

<a name="subsector"></a>
### Sub sector

The value returned is and <code>String</code> with the subsector category of a training plan.



```js
{
    name: 'subsector',
    index: opts.index,
    value: "ELECTRICIDAD"
}
```


<a name="create-your-own-extensions"></a>
## Create your own extensions

To create your own extensions just use the boilerplate in this same folder, file called [metric.js](./metric.js) and complete it as you see it fit, but you must follow the export function signature.

---
Powered by [jsdoc](https://jsdoc.app/)