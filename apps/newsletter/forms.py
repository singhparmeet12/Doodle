from django import forms
from .models import NewsletterSubscriber


class NewsletterForm(forms.ModelForm):
    hp_url = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'tabindex': '-1',
            'autocomplete': 'off',
            'class': 'hp-field',
            'aria-hidden': 'true',
        })
    )

    class Meta:
        model = NewsletterSubscriber
        fields = ['email']
        widgets = {
            'email': forms.EmailInput(attrs={
                'class': 'doodle-input newsletter-input',
                'placeholder': 'your.doodle@sketchbook.art',
                'required': True,
                'aria-label': 'Email address for doodle drops',
            }),
        }

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('hp_url'):
            raise forms.ValidationError("Spam bot detected.")
        return cleaned_data
