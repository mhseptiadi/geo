export const vars: any = {

  correctGeoJson: {
    originalname: 'file.json',
    mimetype: 'application/json',
    path: 'any',
    buffer: Buffer.from(`{
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [125.6, 10.1]
        },
        "properties": {
          "name": "Dinagat Islands"
        }
      }`),
  },

  incorrectGeoJson: {
    originalname: 'file.json',
    mimetype: 'application/json',
    path: 'any',
    buffer: Buffer.from(`{
        "type": 123
      }`),
  },

  incorrectGeoJson2: {
    originalname: 'file.json',
    mimetype: 'application/json',
    path: 'any',
    buffer: Buffer.from(`asdf`),
  },

  invalidGeoDtoValidationResponse: [
    {
      "value": 123,
      "property": "type",
      "children": [],
      "constraints": {
        "isString": "type must be a string"
      }
    },
    {
      "value": {
        "type": 123,
        "coordinates": [
          "125.6",
          "10.1"
        ]
      },
      "property": "geometry",
      "children": [
        {
          "target": {
            "type": 123,
            "coordinates": [
              "125.6",
              "10.1"
            ]
          },
          "value": 123,
          "property": "type",
          "children": [],
          "constraints": {
            "isString": "type must be a string"
          }
        }
      ]
    }
  ],

  adminToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sImlhdCI6MTcxMDAxNjA0MiwiZXhwIjoxOTEwMDE5NjQyfQ.Gbw85jyEB_q57Dn06gRoG0iSpLk60V75PCAp-XFNAaI`,
  userToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTcxMDAxNjA0MiwiZXhwIjoxOTEwMDE5NjQyfQ.xP6MSA583-pj5K3PNPnjmev6YIa9PD7G-FhrN-5fPVg`,
  expiredToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTUxMDAxNjA0MiwiZXhwIjoxNTEwMDE5NjQyfQ.RcrcS4SW_v6jHqs-7syxi49qxt4tJMF4fdqxQ8aHhVE`,
  invalidToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIiLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTcxMDAxNjA0MiwiZXhwIjoxOTEwMDE5NjQyfQ._-mmHTGcGyKAfCmT7ODNQMM1QlqYAM60fd-ynoZwW8Q`,

};
