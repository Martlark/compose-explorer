from flask_mail import Message, current_app
from app import mail
from threading import Thread


def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            app.logger.error("Could not send mail")
            app.logger.error(str(e))


def send_email(subject, sender, recipients, text_body="no text found", html_body=""):
    current_app.logger.info(f"email: Sending {subject} to {recipients}")
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = text_body
    msg.html = html_body
    thr = Thread(target=send_async_email, args=[current_app, msg])
    thr.start()
