

# Cristal ERP

**Modular ERP Platform Based on Microservices Architecture**

Sales, purchases, inventory, human resources, and payroll management — with integrated supervision (monitoring, code quality, automation).

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)

</div>

Live Demo: https://erp-ui-kappa.vercel.app/

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Configuration (Environment Variables)](#configuration-environment-variables)
- [Deployment](#deployment)
- [Observability](#observability)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Cristal ERP** is an enterprise management system built on a microservices architecture. It covers:

- 🔐 **Authentication & user management** (JWT, roles)
- 📦 **Product, order, client, and supplier management**
- 🧾 **Purchasing and procurement**
- 👥 **Human resources**: employees, departments, contracts, leave, payroll
- 📊 **Reporting & auditing**
- 🤖 **Business workflow automation** via n8n
- 📈 **Application monitoring** via Prometheus/Grafana
- ✅ **Code quality** via SonarQube

---

## Architecture
┌──────────────────┐
│ erp-ui │ (React SPA)
└─────────┬─────────┘
│ HTTPS/REST
┌─────────▼─────────┐
│ api-gateway │ :3104
└───┬─────────┬──────┘
┌──────────────┤ ├───────────────┐
┌────────▼──────┐ ┌─────▼──────┐ ┌▼───────────────┐
│ auth-service │ │core-service│ │ hr-service │
│ :3101 │ │ :3102 │ │ :3106 │
└────────┬───────┘ └─────┬──────┘ └────────┬────────┘
└────────────────┼─────────────────┘
│
┌───────▼───────┐
│ MongoDB │ :27017
└────────────────┘

Supervision : Prometheus · Grafana · mongodb-exporter
Quality : SonarQube
Automation : n8n

text

Each business service is an independent **NestJS** microservice with its own logical **MongoDB** database, exposed exclusively through the **API Gateway**. The **React** frontend communicates only with the gateway.

---

## Tech Stack

### Backend
| Component | Technology |
|---|---|
| Framework | NestJS (Node.js / TypeScript) |
| Database | MongoDB + Mongoose |
| Authentication | JWT |
| Inter-service communication | REST via API Gateway |

### Frontend (`erp-ui`)
| Component | Technology |
|---|---|
| UI Library | React 19 |
| UI Kit | MUI (Material UI) + React Bootstrap |
| Routing | React Router v7 |
| HTTP Requests | Axios |
| Charts | Recharts |
| Export | jsPDF, xlsx |

### Infrastructure & DevOps
| Component | Role |
|---|---|
| Docker / Docker Compose | Containerization and local orchestration |
| GitHub Actions | CI/CD Pipeline |
| Docker Hub | Image registry |
| Kubernetes (`k8s-complete.yaml`) | Cluster deployment |
| Prometheus + Grafana | Metrics collection and visualization |
| SonarQube | Static analysis and code quality |
| n8n | Workflow automation (e.g., invoicing) |

---

## Repository Structure
Cristal_ERP/
├── erp-ui/ # React frontend (SPA)
├── services/
│ ├── api-gateway/ # Single API entry point
│ ├── auth-service/ # Authentication & users
│ ├── core-service/ # Products, orders, purchases, clients, suppliers
│ └── hr-service/ # HR: employees, contracts, leave, payroll
├── monitoring/ # Prometheus / Grafana configuration
├── .github/workflows/ # CI/CD pipelines
├── k8s-complete.yaml # Kubernetes manifests
├── docker-compose.yml # Full local orchestration
└── sonar-project.properties # SonarQube configuration


## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [Node.js ≥ 18](https://nodejs.org/) (for development outside containers)

### Launch the Full Stack with Docker

```bash
# Clone the repository
git clone https://github.com/syrinebenanaya/cristal_erp.git
cd cristal_erp

# Start all services
docker-compose up -d


