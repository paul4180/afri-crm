import json
import urllib.request

class Afri:
    def __init__(self, key, base=''):
        self.key = key
        self.base = base.rstrip('/')

    def _send(self, path, body=None):
        data = None if body is None else json.dumps(body).encode()
        req = urllib.request.Request(
            self.base + path,
            data=data,
            headers={'Authorization': 'Bearer ' + self.key, 'Content-Type': 'application/json'},
            method='POST' if body is not None else 'GET',
        )
        with urllib.request.urlopen(req) as res:
            return json.load(res)

    def me(self):
        return self._send('/v1/me')

    def customers(self):
        return self._send('/v1/customers')

    def invoices(self):
        return self._send('/v1/invoices')

    def owing(self):
        return self._send('/v1/owing')

    def create_invoice(self, customer_name, description, amount, phone=None):
        return self._send('/v1/invoices', {
            'customerName': customer_name,
            'description': description,
            'amount': amount,
            'phone': phone,
        })
