import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import FileResponse

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# 1. API: Список доступных бланков
class DocumentTemplateListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        templates = [
            {"id": "consent", "name": "Согласие соседей на пристройку", "description": "Официальный бланк подтверждения отсутствия претензий от владельцев смежных участков."},
            {"id": "statement", "name": "Заявление в архитектуру", "description": "Бланк уведомления местной администрации о начале реконструкции таунхауса."}
        ]
        return Response(templates, status=status.HTTP_200_OK)

# 2. API: Генерация PDF согласия
class GenerateConsentPDFView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        
        owner_name = data.get('owner_name', '____________________')
        owner_iin = data.get('owner_iin', '____________')
        neighbor_name = data.get('neighbor_name', '____________________')
        neighbor_plot = data.get('neighbor_plot', '____')
        property_desc = data.get('property_desc', 'пристройки к таунхаусу')

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        
        p.setFont("Helvetica-Bold", 16)
        p.drawCentredString(300, 750, "SOGLASIE SOSEDEI")
        
        p.setFont("Helvetica", 12)
        p.drawString(50, 700, f"Ya, (FIO soseda): {neighbor_name}")
        p.drawString(50, 680, f"Vladilec smezhnogo uchastka N: {neighbor_plot}")
        p.drawString(50, 640, "Dayu svoe oficialnoe soglasie grahdaninu:")
        p.drawString(50, 620, f"FIO zayavitelya: {owner_name} (IIN: {owner_iin})")
        p.drawString(50, 590, f"Na provedenie stroitelnyh rabot: {property_desc}")
        p.drawString(50, 550, "Pretenziy k snyatiyu granits i parametram postroyki ne imeu.")
        
        p.drawString(50, 450, "Data: _________________")
        p.drawString(350, 450, "Podpis: _________________")
        
        p.showPage()
        p.save()
        
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename='soglasie_sosedei.pdf')
