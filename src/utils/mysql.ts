import { Connection, createConnection, RowDataPacket } from "mysql2";

type Database = {
  name: string;
};

const connectConnection = (
  host: string,
  port: string,
  userName: string,
  password: string
) => {
  return new Promise<Connection>((resolve, reject) => {
    const connection = createConnection({
      host: host,
      port: Number(port),
      user: userName,
      password: password,
    });

    connection.connect((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(connection);
      }
    });
  });
};

const disconnectConnection = (connection: Connection | undefined) => {
  if (!connection) {
    throw Promise.reject();
  }

  connection.destroy();
};

function query<T>(connection: Connection | undefined, sql: string) {
  if (!connection) {
    throw Promise.reject();
  }

  return new Promise<T>((resolve, reject) => {
    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result as unknown as T);
    });
  });
}

const getDatabases = (connection: Connection | undefined) => {
  if (!connection) {
    throw Promise.reject();
  }

  return new Promise<Database[]>((resolve, reject) => {
    connection.query<RowDataPacket[]>("SHOW DATABASES", (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result.map((row) => ({ name: row.Database })));
    });
  });
};

const addDatabase = (
  connection: Connection | undefined,
  database: Database
) => {
  if (!connection) {
    throw Promise.reject();
  }

  return new Promise<void>((resolve, reject) => {
    connection.query(`CREATE DATABASE ${database.name}`, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });
};

const deleteDatabase = (
  connection: Connection | undefined,
  database: Database
) => {
  if (!connection) {
    throw Promise.reject();
  }

  return new Promise<void>((resolve, reject) => {
    connection.query(`DROP DATABASE ${database.name}`, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });
};

const connectDatabase = (
  connection: Connection | undefined,
  database: Database
) => {
  if (!connection) {
    throw Promise.reject();
  }

  return new Promise<void>((resolve, reject) => {
    connection.query(`USE ${database.name}`, (error) => {
      if (error) {
        reject(error);
      }

      resolve();
    });
  });
};

export {
  connectConnection,
  disconnectConnection,
  getDatabases,
  addDatabase,
  deleteDatabase,
  connectDatabase,
  query,
};
