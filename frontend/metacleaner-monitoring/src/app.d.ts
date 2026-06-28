// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		Plotly?: {
			newPlot(id: string, data: unknown[], layout: unknown, config: unknown): void;
			Plots: { resize(el: HTMLElement): void };
		};
	}
}

export {};
