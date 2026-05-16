import { sql } from '@/lib/db';

/** USERS SERVICE */
export async function getAllUsers() {
  const rows = await sql(`
    SELECT *
    FROM users
    ORDER BY id DESC
  `);
  return rows;
}

/** SETTINGS SERVICE */
export async function getAllSettings() {
  const rows = await sql(`SELECT * FROM settings ORDER BY config_key ASC`);
  return rows;
}

export async function updateSetting(key: string, value: string) {
  await sql(`
    INSERT INTO settings (config_key, config_value)
    VALUES ($1, $2)
    ON CONFLICT (config_key) DO UPDATE SET config_value = $2
  `, [key, value]);
}

/** ADMINS SERVICE */
export async function getAllAdmins() {
  const rows = await sql(`
    SELECT id, name, email, role, status, created_at
    FROM admins
    ORDER BY id ASC
  `);
  return rows;
}

export async function deleteAdmin(id: string | number) {
  await sql(`DELETE FROM admins WHERE id = $1`, [id]);
}

export async function updateAdmin(id: string | number, data: any) {
  const { name, email, role, status } = data;
  await sql(`
    UPDATE admins 
    SET name = $1, email = $2, role = $3, status = $4
    WHERE id = $5
  `, [name, email, role, status, id]);
}

export async function createAdmin(data: any) {
  const { name, email, role, status } = data;
  const defaultHash = '$2a$12$Dummy'; 
  const result = await sql(`
    INSERT INTO admins (name, email, password_hash, role, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, role, status, created_at
  `, [name, email, defaultHash, role, status]);
  return result[0];
}
