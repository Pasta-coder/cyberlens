# from fastapi import FastAPI

# app = FastAPI()

# @app.get('/health')
# def health():
#     return {'status': 'ok'}


from fastapi import FastAPI
from app.api.evidence import router as evidence_router

app = FastAPI()

app.include_router(evidence_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
