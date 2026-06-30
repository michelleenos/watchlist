from logging.config import dictConfig

from app.config import settings


def configure_logging():
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,  # keep uvicorn's loggers
            "formatters": {
                "default": {
                    "format": "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
                }
            },
            "handlers": {
                "console": {"class": "logging.StreamHandler", "formatter": "default"}
            },
            "loggers": {"app": {"handlers": ["console"], "level": settings.log_level}},
        }
    )
