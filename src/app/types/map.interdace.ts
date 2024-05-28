export interface IMapFeature {
	id: string;
	type: string;
	geometry: {
		coordinates: number[];
		type: string;
	};
	properties: {
		height: number;
	};
}
