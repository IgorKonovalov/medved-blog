# Feature: Interactive Telegram Bot

## Problem

Potential clients searching for a BMW auto electrician may prefer to contact the business through Telegram rather than filling out a website form or calling directly. Currently there is no way to interact with the business via Telegram — only a one-way notification flow (website form → Telegram) is planned.

## Solution

An interactive Telegram bot that lets users:
- Request a callback (name + phone collected via conversation)
- Browse available services
- Get contact information (address, phone, working hours)
- Send a free-form message to the business owner

The bot acts as an additional lead capture channel alongside the website callback form and direct phone/WhatsApp contact.

## User Flows

### 1. Start / Welcome
- User sends `/start` or opens the bot for the first time
- Bot replies with a welcome message and an inline keyboard menu

### 2. Request Callback
- User taps "Заказать звонок" (Request callback)
- Bot asks for name
- Bot asks for phone number
- Bot confirms the request and forwards it to the owner's chat/group
- Owner receives notification with name, phone, and Telegram username of the requester

### 3. Browse Services
- User taps "Наши услуги" (Our services)
- Bot lists services with short descriptions
- Each service has a link to the website page for details

### 4. Contact Info
- User taps "Контакты" (Contacts)
- Bot sends address, phone number, working hours, and a link to the map/website

### 5. Free-form Message
- Any text that isn't part of a flow gets forwarded to the owner's chat
- Bot confirms the message was sent

## Business Rules

- Callback requests are forwarded immediately to the same Telegram chat/group used by the website form
- Bot responds only in Russian
- Rate limiting: max 5 interactions per minute per user (prevent abuse)
- Services list can be hardcoded initially; dynamic loading from content collections is a follow-up

## Out of Scope (for now)

- Appointment booking / calendar integration
- Payment processing
- AI-powered auto-responses
- Dynamic content from the website's Content Collections (follow-up)
- Multi-language support
