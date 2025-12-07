from asyncio.windows_events import NULL
from app.db.database import get_db
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.models.model import Employees
from app.services.EmployeeService import EmployeeService as employeeService
from app.schemas.Employee import (EmployeeBase, EmployeeOut, EmployeeCreate,EmployeeUpdate)
from app.utils.response import ResponseHandler
from sqlalchemy.orm import Session
from app.models.model import Account
from app.config.security import check_customer_admin

router = APIRouter(
    prefix = "/employee",
    tags = ["Employee"],
    responses = {404:{"description": "Not Found"}}
)

@router.get("/employees")
async def getEmployeeByName(
        skip: int = 0,
        limit: int = 50,
        name: str = "",
        db:Session = Depends(get_db),
        admin_account = Depends(check_customer_admin)):
    try:
        employ_by_name = employeeService.list_employees(db, skip, limit, name)
        return ResponseHandler.success("success",employ_by_name)
    except:
        ResponseHandler.not_found_error("Emloyee",name)

@router.get("/{employee_id}")
async def getEmployeeById(employee_id: int,
        db: Session = Depends(get_db),
        admin_account = Depends(check_customer_admin)):
    try:
        employee = employeeService.get_employee(db,1)
        return ResponseHandler.success("success", employee)
    except:
        ResponseHandler.not_found_error(f"Employee", {employee_id})

@router.post("/create_employee")
async def create_employee(empl: EmployeeCreate,
    db:Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)):
    try:
        employ_out = employeeService.create_employee(db,empl)
        return ResponseHandler.create_success(employ_out.full_name,employ_out.id, employ_out)
    except:
        ResponseHandler.not_found_error("error")

@router.put("/update_employee/{employee_id}")
async def update_employee(empl : EmployeeUpdate,
    employee_id: int,db:Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)):
    try:
        empl_out = employeeService.update_employee(db,employee_id,empl)
        return ResponseHandler.success("success",empl_out)
    except: 
        ResponseHandler.not_found_error("error")

@router.delete("/delete_employee/{employee_id}")
async def delete_employee(
    employee_id: int, 
    db: Session = Depends(get_db),
    admin_account = Depends(check_customer_admin)
):
    try: 
        emp = employeeService.delete_employee(db, employee_id)
        return ResponseHandler.delete_success("Employee", employee_id, None)
    except:
        ResponseHandler.not_found_error("error")
