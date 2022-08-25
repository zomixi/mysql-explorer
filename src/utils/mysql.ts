import { Connection, createConnection } from "mysql2";

const connect = (
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

export { connect };
