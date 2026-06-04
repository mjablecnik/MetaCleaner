export interface User {
	name: string;
	email: string;
}

export async function getCurrentUser(): Promise<User> {
	return { name: 'Jana Nováková', email: 'jana.novakova@email.cz' };
}
