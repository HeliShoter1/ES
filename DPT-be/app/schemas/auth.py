from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from .Customer import CustomerOut

class CustomerLogin(BaseModel):
    """Schema for customer login"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class CustomerRegister(BaseModel):
    """Schema for customer registration"""
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name must be between 2-100 characters")
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number must be between 10-15 characters")
    email: EmailStr
    address: str = Field(..., min_length=5, max_length=200, description="Address must be between 5-200 characters")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class CustomerUpdate(BaseModel):
    """Schema for updating customer profile"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    address: Optional[str] = Field(None, min_length=5, max_length=200)
    password: Optional[str] = Field(None, min_length=6)

class CustomerChangePassword(BaseModel):
    """Schema for changing password"""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password must be at least 6 characters")

class Token(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    customer_id: int
    email: str
    role: str

class TokenData(BaseModel):
    """Schema for token data"""
    customer_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class AuthResponse(BaseModel):
    """Schema for authentication response"""
    success: bool
    message: str
    data: Optional[Token] = None
    customer: Optional[CustomerOut] = None
