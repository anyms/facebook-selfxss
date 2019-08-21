class Menu:
    def __init__(self):
        self.menu = ["Chat message extraction", "Phone number extraction", "Generate payload", "Launch a listener"]

    def show(self):
        for i, menu in enumerate(self.menu):
            print("{}. {}".format(i+1, menu))

        print("\n99. Exit\n")
        inp = int(input("Choose: "))

        if inp == 1:
            return "chat_messages"
        elif inp == 2:
            return "phone_number"
        elif inp == 3:
            return "generate_payload"
        elif inp == 4:
            return "listener"
        elif inp == 99:
            return "exit"