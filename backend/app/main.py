# from fastapi import FastAPI
# from app.api.evidence import router as evidence_router
# from app.api.analyze import router as analyze_router  # 👈 add this line

# from app.api.report import router as report_router
# app.include_router(report_router, prefix="/api")


# app = FastAPI()

# app.include_router(evidence_router, prefix="/api")
# app.include_router(analyze_router, prefix="/api")  # 👈 add this line

# @app.get("/health")
# def health():
#     return {"status": "ok"}


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.upload_evidence import router as upload_router
from app.api.analyze import router as analyze_router
from app.api.report import router as report_router   # ✅ your new import

app = FastAPI(
    title="CyberLens API",
    version="1.0"
)

# ✅ CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register Routers
app.include_router(upload_router, prefix="/api")
app.include_router(analyze_router, prefix="/api")
app.include_router(report_router, prefix="/api")   # ✅ no more error


@app.get("/")
def root():
    return {"status": "CyberLens backend active ✅"}
