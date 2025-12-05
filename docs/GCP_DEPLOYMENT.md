# GCP Deployment Guide

This guide walks you through deploying AskNewton to Google Cloud Platform using Cloud Run.

## Prerequisites

1. **GCP Account**: Create a Google Cloud account at [cloud.google.com](https://cloud.google.com)
2. **gcloud CLI**: Install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Project Setup**: Create a new GCP project

## Step 1: Initialize gcloud

```bash
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## Step 2: Enable Required APIs

```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 3: Deploy

From the project root:

```bash
gcloud builds submit --config cloudbuild.yaml
```

This command will:
1. Build your Docker image
2. Push it to Google Container Registry
3. Deploy it to Cloud Run

## Step 4: Configure Environment Variables

```bash
gcloud run services update asknewton \
  --region us-central1 \
  --set-env-vars="NODE_ENV=production,DATABASE_URL=YOUR_DB_URL,OPENAI_API_KEY=YOUR_KEY"
```

## Step 5: Map Custom Domain

```bash
gcloud run domain-mappings create \
  --service asknewton \
  --domain asknewton.com \
  --region us-central1
```

Then update your DNS records as instructed by GCP.

## Continuous Deployment

To enable automatic deployments on git push:

1. Go to Cloud Build > Triggers
2. Connect your GitHub repository
3. Create a trigger for the `main` branch
4. Use `cloudbuild.yaml` as the build configuration

## Monitoring

View logs:
```bash
gcloud run services logs read asknewton --region us-central1
```

## Cost Optimization

Cloud Run charges only for actual usage. For production:
- Set min instances to 0 (default)
- Set max instances based on expected traffic
- Enable CPU throttling when idle
