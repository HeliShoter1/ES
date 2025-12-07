from enum import Enum

# Enums
class OrderStatus(str, Enum):
    successful = "successful"
    pending = "pending"
    cancelled = "cancelled"

class EmployeeRole(str, Enum):
    admin = "admin"
    staff = "staff"
    manager = "manager"

class EmployeeActivate(str,Enum):
    activate = True
    non_activate = False