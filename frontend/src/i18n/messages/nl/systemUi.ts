/** Feedback dialog, CMS prompts, error surfaces, animal CMS toolbar. */
export const nlSystemUi = {
  'feedback.title': 'Pilot-feedback',
  'feedback.description': 'Deel wat werkt, wat niet, en wat je hier graag nog zou willen.',
  'feedback.about': 'Over:',
  'feedback.messageLabel': 'Jouw bericht',
  'feedback.messagePlaceholder': 'Je gedachten…',
  'feedback.tooLong': 'Bericht is langer dan {{max}} tekens.',
  'feedback.charCount': '{{n}} / {{max}} tekens',
  'feedback.contactLabel': 'Hoe kunnen we je bereiken (optioneel)',
  'feedback.contactHint':
    'Laat leeg als je wilt — je bericht hierboven telt hoe dan ook.',
  'feedback.contactPlaceholder': 'Naam, e-mail of handle',
  'feedback.contactCharCount': '{{n}} / {{max}} tekens',
  'feedback.errorGeneric': 'Er ging iets mis.',
  'feedback.success': 'Bedankt — we hebben je feedback ontvangen!',
  'feedback.close': 'Sluiten',
  'feedback.sending': 'Verzenden…',
  'feedback.send': 'Feedback versturen',

  'cms.confirmRemoveAnimal': 'Dit dier uit de directory verwijderen?',

  'errorBoundary.body':
    'Er ging iets mis bij het laden van de kaart of directory. Probeer opnieuw of vernieuw de pagina.',
  'errorBoundary.tryAgain': 'Opnieuw proberen',
  'errorBoundary.reload': 'Pagina vernieuwen',

  'animalCms.toolbarAria': 'Dier-CMS',
  'animalCms.addAnimal': 'Dier toevoegen',
} as const
