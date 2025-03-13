import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/auth.store";
import { useCommunicationsStore } from "../utils/communications.store";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { CommunicationType, CommunicationStatus } from '../utils/database.types';

type FormStep = "type" | "details" | "confirm";
type RequestType = CommunicationType;

export default function Communications() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { communications, createCommunication, fetchCommunications, isLoading } = useCommunicationsStore();
  
  const [step, setStep] = useState<FormStep>("type");
  const [requestType, setRequestType] = useState<RequestType>("leave_request");
  const [demoUser, setDemoUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
    amount: "",
    details: "",
  });
  const [activeTab, setActiveTab] = useState("new");

  // Check for demo mode
  useEffect(() => {
    const storedDemoUser = localStorage.getItem('imani_demo_user');
    if (storedDemoUser) {
      try {
        setDemoUser(JSON.parse(storedDemoUser));
      } catch (e) {
        console.error('Error parsing demo user:', e);
      }
    }
  }, []);

  // Fetch communications on mount
  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  // Use useEffect for navigation instead of during render
  useEffect(() => {
    if (!profile && !demoUser) {
      navigate("/employee-login");
    }
  }, [profile, demoUser, navigate]);  
  
  // Return early if no profile or demo user
  if (!profile && !demoUser) {
    return null;
  }

  const handleNextStep = () => {
    if (step === "type") setStep("details");
    else if (step === "details") setStep("confirm");
  };

  const handlePrevStep = () => {
    if (step === "details") setStep("type");
    else if (step === "confirm") setStep("details");
  };

  const handleSubmit = async () => {
    try {
      let content = "";
      
      // Format content based on request type
      if (requestType === "leave_request") {
        content = JSON.stringify({
          startDate: formData.startDate.toISOString(), // Convert to ISO string for proper serialization
          endDate: formData.endDate.toISOString(), // Convert to ISO string for proper serialization
          reason: formData.reason
        });
      } else if (requestType === "payment_advance") {
        content = JSON.stringify({
          amount: formData.amount,
          reason: formData.reason
        });
      } else {
        content = formData.details;
      }
      
      await createCommunication({
        employee_id: profile.id,
        channel: profile.communication_channels?.[0] || 'whatsapp',
        type: requestType,
        content: content
      });
      
      toast.success("Request submitted successfully!");
      
      // Reset form
      setStep("type");
      setFormData({
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
        amount: "",
        details: "",
      });
      
      // Switch to history tab
      setActiveTab("history");
      
      // Refresh communications
      fetchCommunications();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    }
  };

  const getStatusColor = (status: CommunicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "type":
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-xl font-medium">What type of request would you like to make?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`cursor-pointer hover:border-primary ${requestType === "leave_request" ? "border-primary border-2" : ""}`}
                onClick={() => setRequestType("leave_request")}>
                <CardHeader>
                  <CardTitle>Leave Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Request time off for vacation, sick leave, or personal reasons</p>
                </CardContent>
              </Card>
              
              <Card className={`cursor-pointer hover:border-primary ${requestType === "payment_advance" ? "border-primary border-2" : ""}`}
                onClick={() => setRequestType("payment_advance")}>
                <CardHeader>
                  <CardTitle>Payment Advance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Request an advance on your salary</p>
                </CardContent>
              </Card>
              
              <Card className={`cursor-pointer hover:border-primary ${requestType === "complaint" ? "border-primary border-2" : ""}`}
                onClick={() => setRequestType("complaint")}>
                <CardHeader>
                  <CardTitle>File a Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Report an issue or concern to HR</p>
                </CardContent>
              </Card>
              
              <Card className={`cursor-pointer hover:border-primary ${requestType === "query" ? "border-primary border-2" : ""}`}
                onClick={() => setRequestType("query")}>
                <CardHeader>
                  <CardTitle>General Query</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Ask a question or request information</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case "details":
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-xl font-medium">
                {requestType === "leave_request" && "Leave Request Details"}
                {requestType === "payment_advance" && "Payment Advance Details"}
                {requestType === "complaint" && "Complaint Details"}
                {requestType === "query" && "Query Details"}
              </h2>
            </div>
            
            {requestType === "leave_request" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.endDate}
                          onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Select 
                    value={formData.reason} 
                    onValueChange={(value) => setFormData({ ...formData, reason: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="family">Family Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            {requestType === "payment_advance" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Requested</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Advance</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please explain why you need this advance"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>
            )}
            
            {(requestType === "complaint" || requestType === "query") && (
              <div className="space-y-2">
                <Label htmlFor="details">
                  {requestType === "complaint" ? "Complaint Details" : "Query Details"}
                </Label>
                <Textarea
                  id="details"
                  placeholder={requestType === "complaint" ? "Please provide details about your complaint" : "Please provide details about your query"}
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={6}
                />
              </div>
            )}
          </div>
        );
        
      case "confirm":
        return (
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-xl font-medium">Confirm Your Request</h2>
              <p className="text-gray-500 mt-2">Please review your request details before submitting</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {requestType === "leave_request" && "Leave Request"}
                  {requestType === "payment_advance" && "Payment Advance"}
                  {requestType === "complaint" && "Complaint"}
                  {requestType === "query" && "General Query"}
                </CardTitle>
                <CardDescription>Submitted by: {profile.full_name}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {requestType === "leave_request" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p>{format(formData.startDate, "PPP")}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p>{format(formData.endDate, "PPP")}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reason</p>
                      <p className="capitalize">{formData.reason}</p>
                    </div>
                  </>
                )}
                
                {requestType === "payment_advance" && (
                  <>
                    <div>
                      <p className="text-sm font-medium">Amount Requested</p>
                      <p>{formData.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Reason</p>
                      <p>{formData.reason}</p>
                    </div>
                  </>
                )}
                
                {(requestType === "complaint" || requestType === "query") && (
                  <div>
                    <p className="text-sm font-medium">Details</p>
                    <p className="whitespace-pre-line">{formData.details}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Add validation checks for each step
  const isStepValid = () => {
    if (step === "type") {
      return !!requestType;
    }
    
    if (step === "details") {
      if (requestType === "leave_request") {
        return !!formData.reason && formData.startDate && formData.endDate;
      }
      if (requestType === "payment_advance") {
        return !!formData.amount && !!formData.reason;
      }
      if (requestType === "complaint" || requestType === "query") {
        return !!formData.details;
      }
    }
    
    return true;
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Employee Portal</h1>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Communications</CardTitle>
          <CardDescription>
            Submit requests, complaints, or queries
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Request</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6">
            {/* Progress indicator */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "type" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-foreground"}`}>
                  1
                </div>
                <div className="h-1 w-16 bg-primary/20">
                  <div className={`h-full bg-primary ${step !== "type" ? "w-full" : "w-0"}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "details" ? "bg-primary text-primary-foreground" : step === "confirm" ? "bg-primary/20 text-foreground" : "bg-primary/20 text-foreground"}`}>
                  2
                </div>
                <div className="h-1 w-16 bg-primary/20">
                  <div className={`h-full bg-primary ${step === "confirm" ? "w-full" : "w-0"}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "confirm" ? "bg-primary text-primary-foreground" : "bg-primary/20 text-foreground"}`}>
                  3
                </div>
              </div>
              <div className="flex justify-center mt-2 text-sm text-muted-foreground">
                <div className="text-center px-4">
                  <p>Select Type</p>
                </div>
                <div className="text-center px-4">
                  <p>Enter Details</p>
                </div>
                <div className="text-center px-4">
                  <p>Confirm</p>
                </div>
              </div>
            </div>

            <CardContent>
              {renderStepContent()}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep} disabled={step === "type" || isLoading}>
                Back
              </Button>
              
              {step !== "confirm" ? (
                <Button onClick={handleNextStep} disabled={!isStepValid() || isLoading}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Request"}
                </Button>
              )}
            </CardFooter>
          </TabsContent>

          <TabsContent value="history">
            <CardContent>
              <div className="space-y-4">
                {communications.length > 0 ? (
                  communications.map((comm) => {
                    // Attempt to parse JSON content for structured display
                    let contentDisplay;
                    try {
                      const parsedContent = JSON.parse(comm.content);
                      if (comm.type === 'leave_request' && parsedContent.startDate && parsedContent.endDate) {
                        // Safely parse dates with error handling
                        let startDateStr, endDateStr;
                        try {
                          startDateStr = new Date(parsedContent.startDate).toLocaleDateString();
                          endDateStr = new Date(parsedContent.endDate).toLocaleDateString();
                        } catch (e) {
                          // Fallback if date parsing fails
                          startDateStr = parsedContent.startDate;
                          endDateStr = parsedContent.endDate;
                        }
                        
                        contentDisplay = (
                          <div className="mt-2">
                            <p><span className="font-medium">Date Range:</span> {startDateStr} to {endDateStr}</p>
                            <p><span className="font-medium">Reason:</span> {parsedContent.reason}</p>
                          </div>
                        );
                      } else if (comm.type === 'payment_advance' && parsedContent.amount) {
                        contentDisplay = (
                          <div className="mt-2">
                            <p><span className="font-medium">Amount:</span> {parsedContent.amount}</p>
                            <p><span className="font-medium">Reason:</span> {parsedContent.reason}</p>
                          </div>
                        );
                      } else {
                        contentDisplay = <p className="mt-2">{comm.content}</p>;
                      }
                    } catch {
                      contentDisplay = <p className="mt-2">{comm.content}</p>;
                    }

                    return (
                      <div
                        key={comm.id}
                        className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium capitalize">{comm.type.replace('_', ' ')}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(comm.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              comm.status
                            )}`}
                          >
                            {comm.status}
                          </span>
                        </div>
                        {contentDisplay}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No requests submitted yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("new")}
                    >
                      Create your first request
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
