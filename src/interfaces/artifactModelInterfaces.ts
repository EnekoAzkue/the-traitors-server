interface Artifact {
    name: string;
    coordinates: coordinates;
    image: string;
    icon: string;
    state: string;
}

interface coordinates {
    x: number;
    y: number;
}

export default Artifact;