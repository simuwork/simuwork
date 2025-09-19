import type { Scenario } from '../types/simulator';

export const scenarios: Scenario[] = [
  {
    title: 'API Integration Challenge',
    description: 'Connect payment processing to user dashboard',
    difficulty: 'Intermediate',
    estimatedTime: '45 minutes',
    skills: ['REST APIs', 'Error Handling', 'State Management']
  },
  {
    title: 'Database Performance Bug',
    description: 'Optimize slow query affecting user login',
    difficulty: 'Advanced',
    estimatedTime: '60 minutes',
    skills: ['SQL Optimization', 'Debugging', 'Performance Analysis']
  },
  {
    title: 'Authentication Implementation',
    description: 'Add JWT authentication to existing app',
    difficulty: 'Intermediate',
    estimatedTime: '90 minutes',
    skills: ['Security', 'JWT', 'User Management']
  },
  {
    title: 'Infrastructure Drift',
    description: "Production doesn't match your Terraform state - identify and resolve the differences",
    difficulty: 'Advanced',
    estimatedTime: '75 minutes',
    skills: ['Terraform', 'Infrastructure as Code', 'Monitoring']
  },
  {
    title: 'Container Issues',
    description: 'Pods are failing to start in the Kubernetes cluster - debug the deployment manifests',
    difficulty: 'Intermediate',
    estimatedTime: '50 minutes',
    skills: ['Kubernetes', 'YAML', 'Observability']
  }
];
