from django.urls import path
from .views import DocumentTemplateListView, GenerateConsentPDFView

urlpatterns = [
    path('templates/', DocumentTemplateListView.as_view(), name='document_templates'),
    path('generate-consent/', GenerateConsentPDFView.as_view(), name='generate_consent'),
]
