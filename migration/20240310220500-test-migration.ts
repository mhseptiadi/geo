import { Connection, createConnection } from 'mongoose';

const geoCollection = 'geos';

async function up(db) {
  // rename properties.name into properties.title
  const connection: Connection = await createConnection(
    db.connectionString,
    {},
  );

  const cursor: any = await connection
    .collection(geoCollection)
    .find();
  const geos: any[] = await cursor.toArray();

  for (const geo of geos) {
    geo.properties.title = geo.properties.name;
    delete geo.properties.name;

    await connection.collection(geoCollection).findOneAndUpdate(
      {
        _id: geo._id,
      },
      {
        $set: geo,
        $unset: { 'geo.properties.name': 1 },
      },
    );
  }

  await connection.close();

  return null;
}

async function down(db) {
  // revert properties.title into properties.name
  const connection: Connection = await createConnection(
    db.connectionString,
    {},
  );

  const cursor: any = await connection
    .collection(geoCollection)
    .find();
  const geos: any[] = await cursor.toArray();
  
  for (const geo of geos) {
    geo.properties.name = geo.properties.title;
    delete geo.properties.title;

    await connection.collection(geoCollection).findOneAndUpdate(
      {
        _id: geo._id,
      },
      {
        $set: geo,
        $unset: { 'geo.properties.title': 1 },
      },
    );
  }

  await connection.close();

  return null;
}

module.exports.up = up;
module.exports.down = down;
