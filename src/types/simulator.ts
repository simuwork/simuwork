export interface TechStack {
  id: string;
  name: string;
  companies: string[];
  popularity: number;
  jobs: number;
  color: string;
}

export interface Scenario {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  skills: string[];
}
