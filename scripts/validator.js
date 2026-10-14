const Validators = {
    description: /^[A-Za-z0-9.,!?'"-](?:[A-Za-z0-9\s.,!?'"-]*[A-Za-z0-9.,!?'"-])?$/,
    amount: /^\d+(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i
};