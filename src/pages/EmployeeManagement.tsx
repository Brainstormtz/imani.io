import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth.store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from '../utils/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WebcamCapture } from "../components/WebcamCapture";

interface Department {
  id: string;
  name: string;
  company_id: string;
  created_at: string;
}

interface Employee {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  department: string | null;
  role: string;
  communication_channels: string[];
  profile_image_url: string | null;
  id_card_url: string | null;
  facial_recognition_data?: any;
  pin_set: boolean;
}

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const { profile, demoMode } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDepartmentDialog, setNewDepartmentDialog] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  
  // New employee form state
  const [newEmployee, setNewEmployee] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    department: '',
    role: 'employee',
    communication_channels: ['whatsapp'],
    profile_image: null as File | null,
    id_card: null as File | null,
  });
  
  // Demo departments
  const demoDepartments = [
    { id: 'dept-1', name: 'Human Resources', company_id: 'demo-company', created_at: new Date().toISOString() },
    { id: 'dept-2', name: 'Finance', company_id: 'demo-company', created_at: new Date().toISOString() },
    { id: 'dept-3', name: 'Operations', company_id: 'demo-company', created_at: new Date().toISOString() },
    { id: 'dept-4', name: 'IT', company_id: 'demo-company', created_at: new Date().toISOString() },
  ];
  
  // Initialize sample employees in demo mode
  useEffect(() => {
    if (demoMode) {
      // Load sample employees data for demo mode
      setEmployees([
        {
          id: 'emp-1',
          full_name: 'John Doe',
          phone_number: '+254712345678',
          email: 'john.doe@example.com',
          department: 'Human Resources',
          role: 'employee',
          communication_channels: ['whatsapp', 'email'],
          profile_image_url: 'https://i.pravatar.cc/150?img=1',
          id_card_url: 'https://example.com/id_card.jpg',
          pin_set: true
        },
        {
          id: 'emp-2',
          full_name: 'Jane Smith',
          phone_number: '+254723456789',
          email: 'jane.smith@example.com',
          department: 'Finance',
          role: 'manager',
          communication_channels: ['whatsapp'],
          profile_image_url: 'https://i.pravatar.cc/150?img=2',
          id_card_url: 'https://example.com/id_card2.jpg',
          pin_set: true
        },
        {
          id: 'emp-3',
          full_name: 'Alice Johnson',
          phone_number: '+254734567890',
          email: null,
          department: 'Operations',
          role: 'employee',
          communication_channels: ['whatsapp'],
          profile_image_url: null,
          id_card_url: null,
          pin_set: false
        }
      ]);
      
      // Set demo departments
      setDepartments(demoDepartments);
    }
  }, [demoMode]);

  // Load employees and departments (only if not in demo mode)
  useEffect(() => {
    if (!demoMode) {
      loadEmployees();
      loadDepartments();
    }
  }, [demoMode]);
  
  const loadDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', profile?.company_id);

      if (error) throw error;
      setDepartments(data || []);
    } catch (err: any) {
      toast.error('Failed to load departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };
  
  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim()) {
      toast.error('Department name cannot be empty');
      return;
    }
    
    try {
      setIsLoadingDepartments(true);
      
      if (demoMode) {
        const newDept = {
          id: `dept-${Date.now()}`,
          name: newDepartmentName,
          company_id: 'demo-company',
          created_at: new Date().toISOString()
        };
        setDepartments([...departments, newDept]);
        toast.success('Department added successfully');
        setNewDepartmentDialog(false);
        setNewDepartmentName('');
        return;
      }
      
      const { data, error } = await supabase
        .from('departments')
        .insert([
          {
            name: newDepartmentName,
            company_id: profile?.company_id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      setDepartments([...departments, data]);
      toast.success('Department added successfully');
      setNewDepartmentDialog(false);
      setNewDepartmentName('');
    } catch (err: any) {
      toast.error('Failed to add department');
    } finally {
      setIsLoadingDepartments(false);
    }
  };
  
  // Handle file uploads
  const uploadFile = async (file: File, path: string) => {
    if (!file) return null;
    
    if (demoMode) {
      // Return a placeholder URL in demo mode
      return `https://example.com/${path}/${file.name}`;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('employee-files')
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('employee-files')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const { data: employees, error } = await supabase
        .from('profiles')
        .select('*, employee_pins(pin_set)')
        .eq('company_id', profile?.company_id);

      if (error) throw error;
      setEmployees(employees as Employee[]);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      
      let profileImageUrl = null;
      let idCardUrl = null;
      
      // Upload files if they exist
      if (newEmployee.profile_image) {
        profileImageUrl = await uploadFile(newEmployee.profile_image, 'profile-images');
      }
      
      if (newEmployee.id_card) {
        idCardUrl = await uploadFile(newEmployee.id_card, 'id-cards');
      }
      
      // Demo mode handling
      if (demoMode) {
        // Add employee locally in demo mode
        const newEmployeeRecord: Employee = {
          id: `emp-${Date.now()}`,
          full_name: newEmployee.full_name,
          phone_number: newEmployee.phone_number,
          email: newEmployee.email || null,
          department: newEmployee.department === 'none' ? null : newEmployee.department,
          role: newEmployee.role,
          communication_channels: newEmployee.communication_channels,
          profile_image_url: profileImageUrl,
          id_card_url: idCardUrl,
          pin_set: false
        };
        
        setEmployees(prev => [...prev, newEmployeeRecord]);
        toast.success('Demo mode: Employee added successfully!');
        setNewEmployee({
          full_name: '',
          phone_number: '',
          email: '',
          department: '',
          role: 'employee',
          communication_channels: ['whatsapp'],
          profile_image: null,
          id_card: null,
        });
        setIsLoading(false);
        return;
      }

      // Create profile
      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            full_name: newEmployee.full_name,
            phone_number: newEmployee.phone_number,
            email: newEmployee.email || null,
            department: newEmployee.department === 'none' ? null : newEmployee.department,
            company_id: profile?.company_id,
            role: newEmployee.role,
            communication_channels: newEmployee.communication_channels,
            profile_image_url: profileImageUrl,
            id_card_url: idCardUrl,
          }
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      // Create employee_pins entry (without PIN)
      const { error: pinError } = await supabase
        .from('employee_pins')
        .insert([
          {
            profile_id: newProfile.id,
            pin_set: false,
          }
        ]);

      if (pinError) throw pinError;

      toast.success('Employee added successfully!');
      setNewEmployee({
        full_name: '',
        phone_number: '',
        email: '',
        department: '',
        role: 'employee',
        communication_channels: ['whatsapp'],
        profile_image: null,
        id_card: null,
      });
      loadEmployees(); // Reload the list
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profile_image' | 'id_card') => {
    if (e.target.files && e.target.files[0]) {
      setNewEmployee({ ...newEmployee, [field]: e.target.files[0] });
    }
  };

  // Handle webcam capture
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const handleCameraCapture = (imageSrc: string) => {
    // Convert base64 to blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        setNewEmployee({ ...newEmployee, profile_image: file });
      });
  };
  
  // Handle communication channel selection
  const handleChannelChange = (checked: boolean, channel: string) => {
    if (checked) {
      setNewEmployee({
        ...newEmployee,
        communication_channels: [...newEmployee.communication_channels, channel]
      });
    } else {
      // Keep at least one communication channel
      if (newEmployee.communication_channels.length > 1) {
        setNewEmployee({
          ...newEmployee,
          communication_channels: newEmployee.communication_channels.filter(c => c !== channel)
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Add Employee Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
            <CardDescription>
              Add a new employee to your company. They will receive a WhatsApp message to set up their PIN when registered.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleAddEmployee}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={newEmployee.full_name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter employee's full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={newEmployee.phone_number}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="Enter employee's phone number"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter employee's email (optional)"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="department">Department</Label>
                    <Dialog open={newDepartmentDialog} onOpenChange={setNewDepartmentDialog}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-xs">
                          + New Department
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Department</DialogTitle>
                          <DialogDescription>
                            Create a new department for your company
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="departmentName">Department Name</Label>
                            <Input
                              id="departmentName"
                              value={newDepartmentName}
                              onChange={(e) => setNewDepartmentName(e.target.value)}
                              placeholder="Enter department name"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setNewDepartmentDialog(false)}>Cancel</Button>
                          <Button type="button" onClick={handleAddDepartment} disabled={isLoadingDepartments}>
                            {isLoadingDepartments ? 'Adding...' : 'Add Department'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Select
                    value={newEmployee.department}
                    onValueChange={(value) => setNewEmployee(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr_admin">HR Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Communication Channels</Label>
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="whatsapp" 
                        checked={newEmployee.communication_channels.includes('whatsapp')}
                        onCheckedChange={(checked) => handleChannelChange(checked as boolean, 'whatsapp')}
                      />
                      <Label htmlFor="whatsapp" className="cursor-pointer">WhatsApp</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email" 
                        checked={newEmployee.communication_channels.includes('email')}
                        onCheckedChange={(checked) => handleChannelChange(checked as boolean, 'email')}
                      />
                      <Label htmlFor="email" className="cursor-pointer">Email</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="profile_image">Profile Image</Label>
                  <div className="flex flex-col space-y-2">
                    <Input
                      id="profile_image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleFileChange(e, 'profile_image')}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Upload a profile photo or use webcam</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsCameraOpen(true)}
                      >
                        Use Camera
                      </Button>
                    </div>
                    {newEmployee.profile_image && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                          <img 
                            src={URL.createObjectURL(newEmployee.profile_image)} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs">Image selected</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="id_card">ID Card</Label>
                  <Input
                    id="id_card"
                    type="file"
                    accept="image/jpeg,image/jpg,application/pdf"
                    onChange={(e) => handleFileChange(e, 'id_card')}
                  />
                  <p className="text-xs text-muted-foreground">Upload ID card (JPG, JPEG, PDF)</p>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Employee'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>
              Manage your company's employees
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Profile</th>
                    <th className="px-6 py-3">Contact Info</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="bg-background border-b">
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={employee.profile_image_url || undefined} />
                            <AvatarFallback>{employee.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{employee.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div>{employee.phone_number}</div>
                          {employee.email && <div className="text-xs text-muted-foreground">{employee.email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {employee.department || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="capitalize">{employee.role.replace('_', ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        {employee.pin_set ? (
                          <span className="text-green-600">Registration Complete</span>
                        ) : (
                          <span className="text-yellow-600">Pending Registration</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Webcam Capture Component */}
      {isCameraOpen && (
        <WebcamCapture 
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={handleCameraCapture}
        />
      )}
    </div>
  );
}