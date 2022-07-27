import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'


const Login = (props) => {

  let history = useNavigate();
  const [credentials, setCredentials] = useState({email: "", password: ""});
  const handleSubmit= async(e)=>{
    e.preventDefault();
    const url = "http://localhost:5000/api/auth/login";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: credentials.email, password: credentials.password})
    });
    const json = await response.json();

    if(json.success){
      // Save the auth token and redirect
      localStorage.setItem('token', json.authtoken);
      history("/");
      props.showAlert("LoggedIn Successfully", "success")
    }
    else{
      props.showAlert("Invalid Credentials", "danger")
    }
  }
  const onChange = (e)=>{
    setCredentials({...credentials, [e.target.name]: e.target.value});
  }
  
  return (
    <div>
      <h2 className="mt-3">Login to Continue using CloudPad</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input type="email" className="form-control" id="email" name="email" aria-describedby="emailHelp" onChange={onChange}/>
          <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input type="password" className="form-control" id="password" name="password" onChange={onChange}/>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default Login