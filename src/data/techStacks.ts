import type { TechStack } from '../types/simulator';

export const techStacks: TechStack[] = [
  {
    id: 'react-node',
    name: 'React + Node.js + PostgreSQL',
    companies: ['Stripe', 'Airbnb', 'Netflix'],
    popularity: 92,
    jobs: 2847,
    color: 'bg-blue-500'
  },
  {
    id: 'angular-dotnet',
    name: 'Angular + .NET + Azure SQL',
    companies: ['Microsoft', 'Accenture', "Ernst & Young"],
    popularity: 78,
    jobs: 1653,
    color: 'bg-red-500'
  },
  {
    id: 'vue-python',
    name: 'Vue.js + Django + PostgreSQL',
    companies: ['GitLab', 'Adobe', 'BMW'],
    popularity: 65,
    jobs: 892,
    color: 'bg-green-500'
  }
];
