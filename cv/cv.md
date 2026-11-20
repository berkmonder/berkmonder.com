# Muhammed Berk Önder

**MLOps Engineer · LLM Systems and AI Infrastructure**

Istanbul, Turkey · [berkmonder@gmail.com](mailto:berkmonder@gmail.com) · +90 545 528 3371 · [linkedin.com/in/berkmonder](https://www.linkedin.com/in/berkmonder) · [github.com/berkmonder](https://github.com/berkmonder) · [berkmonder.com](https://berkmonder.com)

## Summary

MLOps engineer with 4+ years of experience taking machine learning and LLM systems from prototype to production in telecommunications and mobile apps. Builds and runs the whole path: CI/CD for models, training and fine-tuning, serving and inference, monitoring and tracing, and the cloud infrastructure underneath. Hands-on with LLM systems (RAG, tool-using agents, self-hosted model serving), MLflow, Airflow, Docker and GCP, and runs a self-hosted production stack as code. M.Sc. in physics.

## Experience

### MLOps Engineer, Teknasyon

*Aug 2024 – Present*

- Designed and deployed a modular retrieval-augmented generation (RAG) assistant with LangChain and Open WebUI that answers precisely from structured internal data, through custom Python pipelines and tool integrations.
- Built CI/CD with GitHub, Cloud Build and Docker that produces versioned model artifacts and reproducible deployments; containerized ML and LLM services.
- Standardized experiment tracking by integrating MLflow into Airflow pipelines, improving model observability and reproducibility.
- Fine-tuned ~30B-parameter Qwen models on RunPod with better GPU utilization, cutting training time and infrastructure cost.
- Scaled a production spam detection pipeline processing millions of records per week by segmenting its data processing, removing memory bottlenecks and making runs stable.
- Built automated anomaly detection pipelines on GCP with Dataform and Airflow for high-cardinality event data across thousands of dimensions, replacing manual query work.

### Machine Learning Engineer, P.I. Works

*Jul 2022 – Jul 2024*

- Built a telecom LLM assistant with LangChain that combines knowledge base retrieval, SQL data access, analysis and visualization in one interface.
- Developed a heatmap forecasting system that predicts network traffic from football match data with regression models, reducing aggregate error from 77% to 0.75%.
- Implemented multivariate anomaly detection on streaming time series with clustering, improving detection across diverse network scenarios.
- Designed a Monte Carlo synthetic data generation framework that increased data granularity 60×.

## Projects

### Turquoise: an LLM agent on self-hosted infrastructure

*[berkmonder.com/turquoise](https://berkmonder.com/turquoise/)*

- Tool-using agent built with Pydantic AI that answers questions about the website it runs on: it reads the visitor's current page, searches the site and the CV (BM25 and embeddings), and streams its reasoning and tool calls to a React chat built on the Vercel AI SDK.
- Serves Qwen3.5 9B with llama.cpp on a home RTX 3060 behind LiteLLM (per-client keys and limits), with every model call traced in MLflow.
- Designed for cost and capacity on one consumer GPU: per-visitor rate limits, a daily GPU budget and a queue for the model's slots, with a fallback to search-only answers when the GPU is busy or offline.

### Infrastructure as code for production and a home GPU server

*NixOS, GitHub Actions, Podman, Tailscale, Prometheus*

- Runs a production VPS and a GPU workstation from one Nix repository with pull-based deploys: GitHub Actions tests and builds the container images, and the server rolls back automatically when a new version fails its health check.
- Secure and observable by default: rootless containers with one user per app, only HTTPS open to the internet, encrypted secrets (sops), network access rules as code (Tailscale), nightly backups (restic), Prometheus and Grafana monitoring, k6 load tests and external uptime alerts.

## Education

### M.Sc., High Energy and Plasma Physics, İstanbul University

*2024 · GPA 3.63/4.00*

### B.Sc., Physics, İstanbul University

*2021 · GPA 3.31/4.00*

## Skills

- **Programming:** Python, SQL, Bash; Git, uv; AI coding agents (Claude Code)
- **LLMs and agents:** RAG, tool-using agents (Pydantic AI, LangChain, LangGraph), fine-tuning (Hugging Face, Unsloth), model serving (llama.cpp, vLLM, Ollama, LiteLLM)
- **Machine learning:** PyTorch, scikit-learn, TensorFlow, time series forecasting, anomaly detection
- **MLOps and data:** MLflow, Airflow, Prefect, Dataform, PySpark, Pandas, Polars, FastAPI
- **Cloud and infrastructure:** GCP, Docker, Podman, CI/CD (GitHub Actions, Cloud Build), Terraform, NixOS, Linux, Tailscale, RunPod
- **Monitoring:** Prometheus, Grafana, MLflow tracing, k6 load testing
- **Languages:** Turkish (native), English (professional working proficiency)
