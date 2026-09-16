from django import forms
from .models import GuestbookEntry


class GuestbookForm(forms.ModelForm):
    # Honeypot field: hidden in CSS, bots auto-fill it
    hp_website = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'tabindex': '-1',
            'autocomplete': 'off',
            'class': 'hp-field',
            'aria-hidden': 'true',
        })
    )

    class Meta:
        model = GuestbookEntry
        fields = ['name', 'message', 'mood', 'paper_color']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'doodle-input',
                'placeholder': 'Your pen name or nickname (e.g. Captain Doodler)',
                'maxlength': '80',
                'required': True,
            }),
            'message': forms.Textarea(attrs={
                'class': 'doodle-textarea',
                'placeholder': 'Leave a friendly message, sketchbook note, or creative thought...',
                'rows': 4,
                'maxlength': '500',
                'required': True,
            }),
            'mood': forms.Select(attrs={
                'class': 'doodle-select',
            }),
            'paper_color': forms.Select(attrs={
                'class': 'doodle-select',
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('hp_website'):
            raise forms.ValidationError("Spam bot detected.")
        return cleaned_data

    def clean_name(self):
        name = self.cleaned_data.get('name', '').strip()
        if len(name) < 2:
            raise forms.ValidationError("Please provide a nickname with at least 2 characters.")
        return name

    def clean_message(self):
        message = self.cleaned_data.get('message', '').strip()
        if len(message) < 5:
            raise forms.ValidationError("Your note should be at least 5 characters long.")
        return message
